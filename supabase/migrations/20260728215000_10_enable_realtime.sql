-- =====================================================================
-- 10 — Enable Realtime on the portal tables
--
-- Supabase creates the `supabase_realtime` publication empty. Without this,
-- postgres_changes subscriptions connect successfully but never receive an
-- event, so the portal would silently stop being live: a milestone updated
-- in Studio would not reach an open browser until a manual refresh.
--
-- RLS is still enforced on the realtime stream, so a subscriber only
-- receives events for rows their policies already permit.
-- =====================================================================

alter publication supabase_realtime add table public.project_milestones;
alter publication supabase_realtime add table public.change_requests;
alter publication supabase_realtime add table public.sla_metrics;
alter publication supabase_realtime add table public.resource_vault;
alter publication supabase_realtime add table public.staging_environments;
