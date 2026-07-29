-- =====================================================================
-- 13 — SDLC lifecycle + deliverables
-- Sources: FOLIVISION BRD (1.2) sect. 10 (Agile SDLC),
--          FIA PHASE 1 BUDGET & COST (deliverable cost table).
-- Deliverable total reconciles to the Phase 1 contract value of N973,000.
-- =====================================================================

create type public.stage_status as enum ('Complete', 'Active', 'Upcoming');

create table public.sdlc_stages (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  name          text not null,
  summary       text,
  activities    text[] not null default '{}',
  exit_criteria text,
  status        public.stage_status not null default 'Upcoming',
  duration      text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index sdlc_stages_client_idx on public.sdlc_stages(client_id, sort_order);
create trigger sdlc_stages_set_updated_at before update on public.sdlc_stages
  for each row execute function public.set_updated_at();

create table public.deliverables (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  milestone_id  uuid references public.project_milestones(id) on delete set null,
  name          text not null,
  justification text,
  cost          numeric(14,2),
  currency      text not null default 'NGN',
  status        public.milestone_status not null default 'Not Started',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index deliverables_client_idx on public.deliverables(client_id, sort_order);
create index deliverables_milestone_idx on public.deliverables(milestone_id);
create trigger deliverables_set_updated_at before update on public.deliverables
  for each row execute function public.set_updated_at();

alter table public.sdlc_stages  enable row level security;
alter table public.deliverables enable row level security;

create policy "members read sdlc stages"
  on public.sdlc_stages for select to authenticated
  using (client_id in (select public.current_client_ids()));

create policy "members read deliverables"
  on public.deliverables for select to authenticated
  using (client_id in (select public.current_client_ids()));

alter publication supabase_realtime add table public.sdlc_stages;
alter publication supabase_realtime add table public.deliverables;

-- Seed data for the FoliVision tenant lives in the applied migration; see
-- the Supabase dashboard, or re-run `supabase db pull` to materialise it.
