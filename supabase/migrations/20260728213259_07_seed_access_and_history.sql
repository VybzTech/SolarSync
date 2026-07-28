-- =====================================================================
-- 07 — Access credentials + change request history
--
-- SECURITY: the PIN below is a first-issue credential. Rotate it before the
-- portal is shared externally, and never commit a real production PIN:
--   update public.client_access_codes
--      set pin_hash = public.hash_client_pin('NEW_PIN')
--    where code = 'FOLIVISION';
-- =====================================================================

insert into public.client_access_codes (
  client_id, code, label, pin_hash, portal_email, display_name
)
select c.id, 'FOLIVISION', 'FoliVision Shared Portal Access',
       public.hash_client_pin('704612'),
       'folivision.portal@clients.vybztech.com', 'FoliVision Team'
from public.clients c where c.slug = 'folivision';

-- ---------- Magic-link allow-list ----------
insert into public.client_invitations (client_id, email, role, display_name)
select c.id, e.email, e.role::public.member_role, e.display_name
from public.clients c
cross join (values
  ('adedave77@gmail.com', 'admin',  'VybzTech Project Lead'),
  ('folivision.portal@clients.vybztech.com', 'client', 'FoliVision Team')
) as e(email, role, display_name)
where c.slug = 'folivision';

-- ---------- Change request history ----------
insert into public.change_requests (
  client_id, title, description, kind, severity, status, submitted_by_name,
  submitted_date, acknowledged_at, resolved_at, resolution_notes,
  billing_period, counts_toward_quota
)
select c.id, r.title, r.description, r.kind::public.change_request_kind,
       r.severity::public.severity_level, r.status::public.change_request_status,
       r.submitted_by_name, r.submitted_date, r.acknowledged_at, r.resolved_at,
       r.resolution_notes, date_trunc('month', now())::date, r.counts_toward_quota
from public.clients c
cross join (values
  ('Add stale-data indicator to dashboard tiles',
   'When an inverter Wi-Fi logger drops offline, the dashboard currently shows the last known reading with no visual distinction. Add an explicit "Last synced X mins ago" badge so customers do not attribute a hardware dropout to the application.',
   'Feature', 'High', 'Completed', 'Bimbo A.',
   now() - interval '18 days', now() - interval '18 days' + interval '40 minutes',
   now() - interval '15 days',
   'Shipped to staging. Stale threshold set to 15 minutes with amber/red escalation.', true),
  ('Switch savings calculation to banded tariff',
   'Our current tariff is not flat. Band A customers are billed at a different rate per kWh. The savings tracker should accept a tariff band per customer rather than a single global rate.',
   'Enhancement', 'Medium', 'In Progress', 'Tunde O.',
   now() - interval '12 days', now() - interval '12 days' + interval '3 hours', null,
   'Schema updated to support tariff bands. Calculation engine refactor in progress.', true),
  ('Battery threshold alert firing below 20% instead of 30%',
   'Test inverter at the Ikeja bench triggered the low-battery notification at 19% rather than the configured 30% threshold.',
   'Bug', 'High', 'Completed', 'Bimbo A.',
   now() - interval '9 days', now() - interval '9 days' + interval '55 minutes',
   now() - interval '9 days' + interval '6 hours',
   'Comparison operator was evaluating against the wrong field. Patched and regression tested.', true),
  ('Include grid-import kWh on the monthly PDF statement',
   'The downloadable energy statement shows solar generation and estimated savings but omits grid import, which property managers need for reconciliation.',
   'Feature', 'Low', 'Approved', 'Tunde O.',
   now() - interval '7 days', now() - interval '6 days', null,
   'Approved for the Week 6 sprint.', true),
  ('Add Deye SUN-12K to the supported inverter list',
   'We have begun installing the SUN-12K model. It uses the same Solarman logger stick and cloud API structure as our existing units.',
   'Enhancement', 'Medium', 'Approved', 'Folarin V.',
   now() - interval '5 days', now() - interval '4 days', null,
   'In scope - conforms to existing logger and cloud API structure.', true),
  ('Installer mode for field technicians',
   'Field team needs a lightweight view to confirm the data logger is communicating before leaving a customer site.',
   'Feature', 'Medium', 'Pending', 'Folarin V.',
   now() - interval '3 days', null, null, null, true),
  ('Dashboard chart unreadable on smaller Android screens',
   'The 7-day generation chart overflows its container below roughly 380px width, cutting off the y-axis labels.',
   'Bug', 'Low', 'Pending', 'Bimbo A.',
   now() - interval '1 day', null, null, null, true)
) as r(title, description, kind, severity, status, submitted_by_name,
       submitted_date, acknowledged_at, resolved_at, resolution_notes,
       counts_toward_quota)
where c.slug = 'folivision';
