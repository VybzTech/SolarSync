-- =====================================================================
-- 03 — PIN access codes + automatic CR references + SLA counter
-- =====================================================================

-- SECURITY: RLS is enabled with ZERO policies, making this table unreadable
-- by anon/authenticated under any circumstance. Only the service_role (used
-- inside the pin-login Edge Function) can touch it.
create table public.client_access_codes (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  code            text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  label           text,
  pin_hash        text not null,
  portal_email    text not null unique,
  display_name    text,
  is_active       boolean not null default true,
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  last_used_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger client_access_codes_set_updated_at before update on public.client_access_codes
  for each row execute function public.set_updated_at();

comment on table public.client_access_codes is
  'Username + PIN credentials. RLS enabled with no policies => service_role only. PIN is bcrypt hashed; never store or return plaintext.';

-- Hashes a PIN on rotation without the plaintext ever leaving Postgres.
create or replace function public.hash_client_pin(p_pin text)
returns text language sql volatile security definer
set search_path = public, extensions as $$
  select extensions.crypt(p_pin, extensions.gen_salt('bf', 10));
$$;
revoke all on function public.hash_client_pin(text) from public, anon, authenticated;

-- ---------- Auto-generated, per-tenant change request reference ----------
create or replace function public.assign_change_request_reference()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_next   integer;
  v_prefix text;
begin
  if new.reference is not null and new.reference <> '' then
    return new;
  end if;

  -- UPDATE ... RETURNING takes a row-level lock, serialising concurrent
  -- inserts for the same tenant. No sequence gaps, no race condition.
  update public.clients
     set cr_counter = cr_counter + 1
   where id = new.client_id
  returning cr_counter, upper(left(regexp_replace(slug, '[^a-z0-9]', '', 'g'), 4))
    into v_next, v_prefix;

  if v_next is null then
    raise exception 'Unknown client_id % for change request', new.client_id;
  end if;

  new.reference := coalesce(v_prefix, 'CR') || '-CR-' || to_char(v_next, 'FM0000');
  return new;
end;
$$;

create trigger change_requests_assign_reference
  before insert on public.change_requests
  for each row execute function public.assign_change_request_reference();

-- ---------- Keep sla_metrics in sync with reality ----------
-- Recomputes from a COUNT rather than incrementing, so the figure can never
-- drift after an edit, re-classification, or deletion in Supabase Studio.
create or replace function public.recalc_sla_metrics(p_client_id uuid, p_period date)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_used integer;
begin
  select count(*) into v_used
    from public.change_requests
   where client_id = p_client_id
     and billing_period = p_period
     and counts_toward_quota
     and status <> 'Rejected';

  insert into public.sla_metrics (client_id, current_month, requests_used)
  values (p_client_id, p_period, v_used)
  on conflict (client_id, current_month)
  do update set requests_used = excluded.requests_used, updated_at = now();
end;
$$;

create or replace function public.sync_sla_metrics()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recalc_sla_metrics(new.client_id, new.billing_period);
  end if;

  -- Handle a row moving between tenants or billing periods, plus deletes
  if tg_op in ('UPDATE', 'DELETE') then
    if tg_op = 'DELETE'
       or old.client_id      is distinct from new.client_id
       or old.billing_period is distinct from new.billing_period then
      perform public.recalc_sla_metrics(old.client_id, old.billing_period);
    end if;
  end if;

  return null;
end;
$$;

create trigger change_requests_sync_sla
  after insert or update or delete on public.change_requests
  for each row execute function public.sync_sla_metrics();
