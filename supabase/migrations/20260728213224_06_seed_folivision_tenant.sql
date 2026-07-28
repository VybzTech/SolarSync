-- =====================================================================
-- 06 — Seed the FoliVision tenant
-- Figures sourced from: FOLIVISION BRD (1.2), FOLIVISION SLA (v1.1),
-- FIA Maintenance Framework, FIA PHASE 1 BUDGET & COST.
-- Asset URLs are placeholders pending upload to storage/CDN.
--
-- To onboard an additional client, copy this file, change the slug and the
-- data rows. Nothing here is hard-coded anywhere else in the stack.
-- =====================================================================

insert into public.clients (
  slug, name, legal_name, engagement_title, primary_color, accent_color,
  engagement_start, uat_review_at, contract_status, invoice_status,
  contract_value, currency
) values (
  'folivision', 'FoliVision', 'FoliVision Inverters Limited',
  'FIA - Phase 1: Website Dashboard MVP',
  '#006837', '#FBB040',
  date '2026-07-13',
  timestamptz '2026-09-09 08:00:00+00',   -- 09:00 WAT
  'SLA v1.1 & NDA Executed',
  'Phase 1.1 settled - N703,000 received',
  973000.00, 'NGN'
);

-- ---------- Phase 1 milestones (BRD section 11.2 delivery table) ----------
insert into public.project_milestones (
  client_id, phase_name, description, status, progress_percentage,
  target_date, started_date, completed_date, success_criteria, sort_order
)
select c.id, m.phase_name, m.description, m.status::public.milestone_status,
       m.progress, m.target_date, m.started_date, m.completed_date,
       m.success_criteria, m.sort_order
from public.clients c
cross join (values
  ('Core Infrastructure',
   'Provision cloud servers, PostgreSQL, Redis cache, API gateways and SSL security policies on DigitalOcean.',
   'Completed', 100, date '2026-07-17', date '2026-07-13', date '2026-07-17',
   'All servers, databases and APIs provisioned and tested.', 1),
  ('SolarmanV5 Data Pipeline',
   'Real-time integration with the inverter cloud. Polling every 5 minutes with fallback logic and stale-data detection.',
   'In Progress', 60, date '2026-08-07', date '2026-07-20', null,
   'Accurately populated database instances; highly performant worker services.', 2),
  ('Web Dashboard Configuration',
   'Responsive interface for live kWh, battery levels, grid status, trend visualisations, savings tracker and PDF export.',
   'In Progress', 40, date '2026-08-28', date '2026-07-27', null,
   'Working and insightful dashboard for analysis and metrics of data.', 3),
  ('Throughput Testing',
   'Load testing, performance optimisation and system validation against the <5s latency target.',
   'Not Started', 0, date '2026-09-04', null, null,
   'Performance benchmarks met; 99%+ uptime sustained under load.', 4),
  ('UAT & Demo Readiness',
   'End-to-end system testing, documentation handover and stakeholder review.',
   'Not Started', 0, date '2026-09-09', null, null,
   'Full lifecycle demo passes without critical issues; stakeholder sign-off.', 5)
) as m(phase_name, description, status, progress, target_date, started_date,
       completed_date, success_criteria, sort_order)
where c.slug = 'folivision';

-- ---------- SLA response matrix (FIA Maintenance Framework section 3) ----------
insert into public.sla_response_tiers (
  client_id, severity, trigger_summary, response_time, resolution_target,
  support_hours, sort_order
)
select c.id, t.severity::public.severity_level, t.trigger_summary,
       t.response_time, t.resolution_target, t.support_hours, t.sort_order
from public.clients c
cross join (values
  ('Critical', 'Full system outage, payment failure, security breach',
   '30 minutes', '4 hours', '24/7', 1),
  ('High', 'Major feature unavailable, data inconsistency',
   '1 hour', '8 hours', '24/7 (critical only)', 2),
  ('Medium', 'Partial feature degradation, performance issues',
   '4 hours', '24 hours', 'Mon-Fri, 8AM-6PM WAT', 3),
  ('Low', 'Minor bugs, cosmetic issues, feature requests',
   '1 business day', '5 business days', 'Mon-Fri, 8AM-6PM WAT', 4)
) as t(severity, trigger_summary, response_time, resolution_target,
       support_hours, sort_order)
where c.slug = 'folivision';

-- ---------- SLA quota for the current billing month ----------
insert into public.sla_metrics (client_id, current_month, requests_used,
                                requests_limit, overage_rate, currency)
select c.id, date_trunc('month', now())::date, 0, 50, 10000.00, 'NGN'
from public.clients c where c.slug = 'folivision';

-- ---------- Staging & sublinks hub ----------
insert into public.staging_environments (
  client_id, label, description, url, embed_url, is_embed, health,
  health_note, last_checked_at, sort_order
)
select c.id, s.label, s.description, s.url, s.embed_url, s.is_embed,
       s.health::public.environment_health, s.health_note, now(), s.sort_order
from public.clients c
cross join (values
  ('Web Dashboard - Staging',
   'Live build of the Phase 1 customer monitoring dashboard.',
   'https://staging-app.folivision.com', null, false,
   'Operational', 'Responding normally', 1),
  ('Admin Portal - Staging',
   'Internal operations console for inverter and customer management.',
   'https://staging-admin.folivision.com', null, false,
   'Degraded', 'Auth module under active development', 2),
  ('SolarmanV5 API Pipeline',
   'Upstream inverter cloud connection. Polls every 5 minutes with fallback.',
   'https://globalapi.solarmanpv.com', null, false,
   'Operational', 'Last successful poll within window', 3),
  ('Figma Interactive Prototype',
   'Clickable Phase 1 design prototype - dashboard, savings tracker, health view.',
   'https://www.figma.com/design/PLACEHOLDER/FoliVision-FIA',
   'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FPLACEHOLDER%2FFoliVision-FIA',
   true, 'Operational', 'Prototype v0.9', 4)
) as s(label, description, url, embed_url, is_embed, health, health_note, sort_order)
where c.slug = 'folivision';

-- ---------- Resource vault ----------
insert into public.resource_vault (
  client_id, document_name, description, url, type, category, version,
  file_size, is_confidential, sort_order
)
select c.id, r.document_name, r.description, r.url, r.type::public.resource_kind,
       r.category, r.version, r.file_size, r.is_confidential, r.sort_order
from public.clients c
cross join (values
  ('FoliVision BRD', 'Business Requirements Document covering all three delivery phases.',
   '/vault/folivision/brd-v1.2.pdf', 'PDF', 'Requirements', 'v1.2', '2.1 MB', true, 1),
  ('Service Level Agreement', 'Executed SLA defining uptime, response times and escalation procedure.',
   '/vault/folivision/sla-v1.1.pdf', 'PDF', 'Contracts', 'v1.1', '890 KB', true, 2),
  ('Maintenance Framework', 'Post-deployment change management and bug resolution framework.',
   '/vault/folivision/maintenance-framework.pdf', 'PDF', 'Contracts', 'v1.0', '640 KB', true, 3),
  ('Non-Disclosure Agreement', 'Mutual NDA executed between FoliVision Inverters Ltd and VybzTech Inc.',
   '/vault/folivision/nda-signed.pdf', 'PDF', 'Contracts', 'Signed', '268 KB', true, 4),
  ('Phase 1 Budget & Cost Analysis', 'Infrastructure and development cost breakdown for the Website Dashboard MVP.',
   '/vault/folivision/phase-1-budget.pdf', 'PDF', 'Commercial', 'v1.0', '410 KB', true, 5),
  ('Invoice - Phase 1.1', 'Infrastructure setup fee plus 70% development deliverable fee.',
   '/vault/folivision/invoice-phase-1.1.pdf', 'PDF', 'Commercial', '1.1', '183 KB', true, 6),
  ('Brand Kit', 'Vector logos, colour palette and typography guidance.',
   '/vault/folivision/brand-kit.zip', 'Archive', 'Brand', 'v1.0', '12.4 MB', false, 7),
  ('Figma Design Board', 'Source design file for the Phase 1 dashboard interface.',
   'https://www.figma.com/design/PLACEHOLDER/FoliVision-FIA', 'Figma', 'Design', 'v0.9', null, false, 8)
) as r(document_name, description, url, type, category, version, file_size,
       is_confidential, sort_order)
where c.slug = 'folivision';
