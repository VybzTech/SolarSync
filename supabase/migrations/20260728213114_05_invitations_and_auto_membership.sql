-- =====================================================================
-- 05 — Magic-link allow-list
-- A magic link can be requested by anyone, but only an invited address is
-- bound to a tenant. Uninvited users authenticate into an empty portal
-- because every RLS policy resolves to zero rows for them.
-- =====================================================================

create table public.client_invitations (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  email        text not null unique check (position('@' in email) > 1),
  role         public.member_role not null default 'client',
  display_name text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create or replace function public.normalise_invitation_email()
returns trigger language plpgsql set search_path = public as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create trigger client_invitations_normalise
  before insert or update on public.client_invitations
  for each row execute function public.normalise_invitation_email();

alter table public.client_invitations enable row level security;
-- No policies: the allow-list is service_role / Studio only. A client must
-- never be able to enumerate who else has access.
revoke all on public.client_invitations from anon, authenticated;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_invite public.client_invitations%rowtype;
begin
  select * into v_invite from public.client_invitations
   where email = lower(trim(new.email)) and is_active limit 1;

  if found then
    insert into public.client_members (client_id, user_id, role, display_name)
    values (v_invite.client_id, new.id, v_invite.role,
            coalesce(v_invite.display_name, split_part(new.email, '@', 1)))
    on conflict (client_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

comment on function public.handle_new_auth_user() is
  'Fires on signup. Binds the user to a tenant if their address is on the client_invitations allow-list.';
