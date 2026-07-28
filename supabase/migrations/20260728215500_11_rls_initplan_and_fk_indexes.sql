-- =====================================================================
-- 11 — RLS init-plan optimisation + covering FK indexes
--
-- A bare auth.uid() inside a policy is re-evaluated once per candidate row.
-- Wrapping it in a scalar subquery lets Postgres hoist it into an InitPlan
-- and evaluate it a single time per statement.
-- =====================================================================

drop policy "members submit change requests" on public.change_requests;

create policy "members submit change requests"
  on public.change_requests for insert to authenticated
  with check (
    client_id in (select public.current_client_ids())
    and submitted_by = (select auth.uid())
    and status = 'Pending'
    and billing_period = date_trunc('month', now())::date
    and counts_toward_quota = true
  );

-- Covering indexes for foreign keys flagged by the performance advisor.
create index if not exists change_requests_submitted_by_idx
  on public.change_requests(submitted_by);
create index if not exists client_access_codes_client_idx
  on public.client_access_codes(client_id);
create index if not exists client_invitations_client_idx
  on public.client_invitations(client_id);
