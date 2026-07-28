-- =====================================================================
-- 08 — PIN verification with brute-force lockout
-- Comparison happens inside Postgres; the hash never leaves the database.
-- Callable only by service_role (from the pin-login Edge Function).
-- =====================================================================

create or replace function public.verify_client_pin(p_code text, p_pin text)
returns jsonb language plpgsql volatile security definer
set search_path = public, extensions as $$
declare
  v_row         public.client_access_codes%rowtype;
  v_max_tries   constant integer := 5;
  v_lock_window constant interval := interval '15 minutes';
begin
  if p_code is null or p_pin is null then
    return jsonb_build_object('ok', false, 'reason', 'invalid_credentials');
  end if;

  select * into v_row from public.client_access_codes
   where code = upper(trim(p_code)) for update;

  -- Unknown code and wrong PIN return an identical response so the endpoint
  -- cannot be used to enumerate valid client codes.
  if not found or not v_row.is_active then
    return jsonb_build_object('ok', false, 'reason', 'invalid_credentials');
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return jsonb_build_object('ok', false, 'reason', 'locked',
      'retry_after_seconds', ceil(extract(epoch from (v_row.locked_until - now())))::int);
  end if;

  if extensions.crypt(p_pin, v_row.pin_hash) <> v_row.pin_hash then
    update public.client_access_codes
       set failed_attempts = failed_attempts + 1,
           locked_until = case when failed_attempts + 1 >= v_max_tries
                               then now() + v_lock_window else locked_until end
     where id = v_row.id;

    return jsonb_build_object('ok', false,
      'reason', case when v_row.failed_attempts + 1 >= v_max_tries
                     then 'locked' else 'invalid_credentials' end,
      'attempts_remaining', greatest(v_max_tries - (v_row.failed_attempts + 1), 0));
  end if;

  update public.client_access_codes
     set failed_attempts = 0, locked_until = null, last_used_at = now()
   where id = v_row.id;

  return jsonb_build_object('ok', true, 'client_id', v_row.client_id,
    'portal_email', v_row.portal_email, 'display_name', v_row.display_name);
end;
$$;

revoke all on function public.verify_client_pin(text, text) from public, anon, authenticated;
grant execute on function public.verify_client_pin(text, text) to service_role;
