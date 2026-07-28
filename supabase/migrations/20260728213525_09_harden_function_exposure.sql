-- =====================================================================
-- 09 — Close the SECURITY DEFINER RPC surface
--
-- PostgREST exposes every function in `public` as an RPC endpoint, so the
-- trigger helpers were callable directly by anon/authenticated. The material
-- risk was `recalc_sla_metrics(uuid, date)`: a SECURITY DEFINER function
-- accepting an arbitrary client_id, giving any caller a cross-tenant write
-- into sla_metrics.
--
-- Executing a trigger does not require EXECUTE on its function, so these
-- revocations do not affect normal operation.
-- =====================================================================

revoke all on function public.set_updated_at()                   from public, anon, authenticated;
revoke all on function public.normalise_invitation_email()       from public, anon, authenticated;
revoke all on function public.assign_change_request_reference()  from public, anon, authenticated;
revoke all on function public.handle_new_auth_user()             from public, anon, authenticated;
revoke all on function public.sync_sla_metrics()                 from public, anon, authenticated;

revoke all on function public.recalc_sla_metrics(uuid, date)     from public, anon, authenticated;
grant execute on function public.recalc_sla_metrics(uuid, date)  to service_role;

-- current_client_ids() intentionally remains executable by `authenticated`:
-- every RLS policy calls it, and it only ever returns rows belonging to
-- auth.uid(). It is not a data-disclosure vector.

comment on function public.recalc_sla_metrics(uuid, date) is
  'Service-role only. Recomputes the SLA counter for a tenant/period from change_requests.';
