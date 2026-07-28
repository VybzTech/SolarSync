-- =====================================================================
-- 04 — Row Level Security
-- Model: a user sees a row only if they are a member of that row's tenant.
-- Writes are limited to inserting change requests for their own tenant.
-- All administrative mutation happens via service_role (Supabase Studio),
-- which bypasses RLS by design.
-- =====================================================================

-- SECURITY DEFINER so it can read client_members without triggering the
-- recursive RLS check a plain subquery would cause.
create or replace function public.current_client_ids()
returns setof uuid language sql stable security definer
set search_path = public as $$
  select client_id from public.client_members where user_id = auth.uid();
$$;
revoke all on function public.current_client_ids() from public, anon;
grant execute on function public.current_client_ids() to authenticated;

alter table public.clients               enable row level security;
alter table public.client_members        enable row level security;
alter table public.client_access_codes   enable row level security;
alter table public.project_milestones    enable row level security;
alter table public.change_requests       enable row level security;
alter table public.sla_metrics           enable row level security;
alter table public.resource_vault        enable row level security;
alter table public.staging_environments  enable row level security;
alter table public.sla_response_tiers    enable row level security;

-- NOTE: public.client_access_codes intentionally has NO policies.
-- RLS enabled + zero policies = total denial for anon and authenticated.

create policy "members read own client"
  on public.clients for select to authenticated
  using (id in (select public.current_client_ids()));

create policy "members read own membership rows"
  on public.client_members for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read milestones"
  on public.project_milestones for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read own change requests"
  on public.change_requests for select to authenticated
  using (client_id in (select public.current_client_ids()));

-- A member may raise a request, but only against their own tenant and only
-- under their own identity, at Pending status, in the current billing period.
create policy "members submit change requests"
  on public.change_requests for insert to authenticated
  with check (
    client_id in (select public.current_client_ids())
    and submitted_by = auth.uid()
    and status = 'Pending'
    and billing_period = date_trunc('month', now())::date
    and counts_toward_quota = true
  );

-- Deliberately no UPDATE or DELETE policy: once filed, a request is
-- VybzTech's to triage. Clients cannot rewrite history or self-approve.

create policy "members read sla metrics"
  on public.sla_metrics for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read resources"
  on public.resource_vault for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read staging environments"
  on public.staging_environments for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read sla tiers"
  on public.sla_response_tiers for select to authenticated
  using (client_id in (select public.current_client_ids()));

revoke all on public.client_access_codes from anon, authenticated;
