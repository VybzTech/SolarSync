-- =====================================================================
-- SolarSync :: VybzTech Client Portal
-- 01 — Core tenancy, enums, updated_at plumbing
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

create type public.milestone_status as enum ('Not Started', 'In Progress', 'Review', 'Completed');
create type public.change_request_status as enum ('Pending', 'Approved', 'In Progress', 'Completed', 'Rejected');
create type public.change_request_kind as enum ('Feature', 'Bug', 'Enhancement');
-- Mirrors the four severity tiers in the FIA Maintenance Framework
create type public.severity_level as enum ('Critical', 'High', 'Medium', 'Low');
create type public.resource_kind as enum ('PDF', 'Link', 'Figma', 'Doc', 'Image', 'Archive');
create type public.member_role as enum ('client', 'admin');
create type public.environment_health as enum ('Operational', 'Degraded', 'Down', 'Unknown');

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Tenant root ----------
create table public.clients (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null,
  legal_name        text,
  engagement_title  text,
  logo_url          text,
  primary_color     text not null default '#006837',
  accent_color      text not null default '#FBB040',
  engagement_start  date,
  uat_review_at     timestamptz,
  contract_status   text,
  invoice_status    text,
  contract_value    numeric(14,2),
  currency          text not null default 'NGN',
  -- Per-tenant change-request reference counter (row lock = race free)
  cr_counter        integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ---------- Membership: maps an auth user to a tenant ----------
create table public.client_members (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         public.member_role not null default 'client',
  display_name text,
  created_at   timestamptz not null default now(),
  unique (client_id, user_id)
);

create index client_members_user_id_idx on public.client_members(user_id);
create index client_members_client_id_idx on public.client_members(client_id);

comment on table public.clients is
  'Tenant root. One row per VybzTech client engagement (FoliVision, and future clients).';
comment on table public.client_members is
  'Join table binding a Supabase auth user to a tenant. Drives every RLS policy.';
