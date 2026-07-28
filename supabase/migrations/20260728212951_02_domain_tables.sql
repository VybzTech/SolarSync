-- =====================================================================
-- 02 — Portal domain tables (all tenant-scoped)
-- =====================================================================

create table public.project_milestones (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  phase_name          text not null,
  description         text,
  status              public.milestone_status not null default 'Not Started',
  progress_percentage integer not null default 0 check (progress_percentage between 0 and 100),
  target_date         date,
  started_date        date,
  completed_date      date,
  success_criteria    text,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index project_milestones_client_idx on public.project_milestones(client_id, sort_order);
create trigger project_milestones_set_updated_at before update on public.project_milestones
  for each row execute function public.set_updated_at();

create table public.change_requests (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  reference           text not null unique,
  title               text not null check (char_length(trim(title)) between 3 and 160),
  description         text not null check (char_length(trim(description)) between 10 and 4000),
  kind                public.change_request_kind not null default 'Feature',
  severity            public.severity_level not null default 'Medium',
  status              public.change_request_status not null default 'Pending',
  submitted_by        uuid references auth.users(id) on delete set null,
  submitted_by_name   text,
  submitted_date      timestamptz not null default now(),
  acknowledged_at     timestamptz,
  resolved_at         timestamptz,
  resolution_notes    text,
  -- Billing period this request counts against (first day of month, UTC)
  billing_period      date not null default date_trunc('month', now())::date,
  -- Critical bugs are prioritised and tracked outside the 50/month cap
  counts_toward_quota boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index change_requests_client_idx on public.change_requests(client_id, submitted_date desc);
create index change_requests_period_idx on public.change_requests(client_id, billing_period);
create trigger change_requests_set_updated_at before update on public.change_requests
  for each row execute function public.set_updated_at();

create table public.sla_metrics (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients(id) on delete cascade,
  current_month  date not null default date_trunc('month', now())::date,
  requests_used  integer not null default 0 check (requests_used >= 0),
  requests_limit integer not null default 50 check (requests_limit > 0),
  overage_rate   numeric(12,2) not null default 10000.00,
  currency       text not null default 'NGN',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (client_id, current_month)
);
create trigger sla_metrics_set_updated_at before update on public.sla_metrics
  for each row execute function public.set_updated_at();

create table public.resource_vault (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  document_name   text not null,
  description     text,
  url             text not null,
  type            public.resource_kind not null default 'PDF',
  category        text,
  version         text,
  file_size       text,
  is_confidential boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index resource_vault_client_idx on public.resource_vault(client_id, sort_order);
create trigger resource_vault_set_updated_at before update on public.resource_vault
  for each row execute function public.set_updated_at();

create table public.staging_environments (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  label           text not null,
  description     text,
  url             text,
  embed_url       text,
  is_embed        boolean not null default false,
  health          public.environment_health not null default 'Unknown',
  health_note     text,
  last_checked_at timestamptz,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index staging_environments_client_idx on public.staging_environments(client_id, sort_order);
create trigger staging_environments_set_updated_at before update on public.staging_environments
  for each row execute function public.set_updated_at();

create table public.sla_response_tiers (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references public.clients(id) on delete cascade,
  severity          public.severity_level not null,
  trigger_summary   text not null,
  response_time     text not null,
  resolution_target text not null,
  support_hours     text not null,
  sort_order        integer not null default 0,
  unique (client_id, severity)
);
create index sla_response_tiers_client_idx on public.sla_response_tiers(client_id, sort_order);
