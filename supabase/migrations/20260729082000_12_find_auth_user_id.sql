-- =====================================================================
-- 12 — Reliable auth user lookup for the pin-login function
--
-- PostgREST only exposes the `public` schema, so the Edge Function's
-- `.schema('auth').from('users')` call always failed. That made the
-- membership reconciliation path dead code: if a client_members row were
-- ever removed, a PIN user would be stuck on "no workspace linked" with no
-- way to self-heal.
--
-- This exposes a narrow, service-role-only lookup instead of opening up
-- the auth schema.
-- =====================================================================

create or replace function public.find_auth_user_id(p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from auth.users where email = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.find_auth_user_id(text) from public, anon, authenticated;
grant execute on function public.find_auth_user_id(text) to service_role;

comment on function public.find_auth_user_id(text) is
  'Service-role only. Resolves an auth user id by email for the pin-login Edge Function.';
