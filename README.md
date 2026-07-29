# SolarSync

**Client delivery portal by VybzTech Inc.** — a multi-tenant B2B portal giving clients live visibility into milestone progress, staging environments, SLA-aligned change requests, and project documents.

Currently serving the **FoliVision Inverters Application (FIA)** engagement.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Lucide icons |
| Routing | React Router 7 (SPA) |
| Backend | Supabase — Postgres 17, Auth, Realtime, Edge Functions |
| Hosting | Netlify (CI/CD from Git) |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:5173
```

### Environment variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Publishable (anon) key — safe to expose; RLS gates everything |
| `VITE_CLIENT_SLUG` | Tenant this deployment serves (`folivision`) |

> The `service_role` key must **never** appear in this repo or in Netlify's build variables. It lives only in Supabase Edge Function secrets.

---

## Architecture

```
src/
├── main.tsx                  Provider composition + router mount
├── App.tsx                   Auth gate → routes
├── types/domain.ts           Hand-written types mirroring the Postgres schema
├── lib/
│   ├── env.ts                Fail-fast env validation
│   ├── supabase.ts           Shared browser client (anon key, PKCE)
│   ├── tokens.ts             Single source of truth for status colours
│   ├── format.ts             Timezone-aware dates, NGN currency, relative time
│   └── cn.ts                 Class-name joiner
├── providers/
│   ├── AuthProvider.tsx      Session lifecycle, PIN + magic-link sign-in
│   └── TenantProvider.tsx    Resolves which client engagement the user belongs to
├── hooks/
│   ├── useSupabaseQuery.ts   Generic reader: race-safe, realtime-invalidated
│   ├── usePortalData.ts      One typed hook per table + the submit mutation
│   └── useCountdown.ts       Ticking countdown to the UAT date
├── components/
│   ├── ui/                   Card, Badge, Button, Field, Toast, ProgressBar, states
│   └── layout/               AppShell, Sidebar, PageHeader, Logo, nav config
└── features/                 One folder per view — self-contained
    ├── auth/                 LoginScreen, AccessDenied
    ├── dashboard/            Milestones, countdown, status widgets
    ├── staging/              Environment cards, Figma embed, API health
    ├── requests/             SLA counter, submission form, history table
    └── vault/                Grouped document grid
```

Every feature folder is independent — adding a fifth view means adding one folder plus one entry in `components/layout/navigation.ts`.

---

## The four views

**1. Dashboard** — Phase progress bars driven by `project_milestones`, a live countdown to the UAT / Staging Review date, and quick-status widgets for overall progress, SLA consumption, contract status and phase value.

**2. Staging Hub** — Clickable cards to each staging environment, an embedded Figma prototype, and an aggregate API health strip covering the SolarmanV5 pipeline.

**3. Change Requests** — Submission form with client-side and database-level validation, a live SLA counter (`7 of 50`) that escalates amber at 70% and red past the cap, filterable request history with expandable detail, and the contractual severity/response matrix.

**4. Resource Vault** — Documents grouped by category (Requirements, Contracts, Commercial, Brand, Design) with type, version, size and confidentiality markers.

---

## Data model

Multi-tenant from day one. Every domain table carries a `client_id`, so onboarding a second client is a data operation, not a code change.

| Table | Purpose |
|---|---|
| `clients` | Tenant root — branding, contract status, UAT date, CR counter |
| `client_members` | Binds an auth user to a tenant; drives every RLS policy |
| `client_invitations` | Magic-link allow-list (service-role only) |
| `client_access_codes` | Username + bcrypt PIN credentials (service-role only) |
| `project_milestones` | Delivery phases with status and progress |
| `change_requests` | SLA-aligned requests, auto-referenced `FOLI-CR-0001` |
| `sla_metrics` | Per-tenant, per-month usage against the 50-request cap |
| `sla_response_tiers` | Contractual response/resolution matrix by severity |
| `resource_vault` | Documents and assets |
| `staging_environments` | Links, embeds and health status |

### Automatic behaviour

- **Change request references** are generated per tenant via a row-locking counter — no gaps, no race conditions under concurrent submission.
- **The SLA counter recomputes from a `COUNT`** on every insert, update and delete, so the figure can never drift after an edit or re-classification in Studio. Rejected requests are excluded automatically.
- **New auth users are bound to a tenant** by a trigger that matches their email against `client_invitations`.

---

## Security model

Row Level Security is the enforcement boundary — the anon key is public by design and is useless without a session.

- A user sees a row **only** if they hold a `client_members` row for that tenant.
- The **only** permitted client write is inserting a change request, and the policy pins `client_id`, `submitted_by = auth.uid()`, `status = 'Pending'`, the current billing period, and `counts_toward_quota = true`.
- There is deliberately **no UPDATE or DELETE policy** on `change_requests` — once filed, a request is VybzTech's to triage. Clients cannot rewrite history or self-approve.
- `client_access_codes` and `client_invitations` have RLS enabled with **zero policies** and privileges revoked, so they are unreachable from the browser under any circumstance.
- All milestone, SLA and contract mutation happens through Supabase Studio using the service role.

### PIN authentication

The PIN is never verified in the browser. `POST /functions/v1/pin-login` compares a bcrypt hash **inside Postgres**, applies a 5-attempt / 15-minute lockout, and returns a single-use token hash. The browser exchanges that for a genuine Supabase session, so RLS applies identically to PIN and magic-link users.

An unknown client code and a wrong PIN return byte-identical responses, so the endpoint cannot be used to enumerate valid client IDs.

### Verified

| Check | Result |
|---|---|
| Cross-tenant read isolation | Blocked |
| Cross-tenant change request insert | Blocked |
| Spoofed `submitted_by` | Blocked |
| Self-approval on insert | Blocked |
| Quota-bypass insert | Blocked |
| Update / delete own request | Blocked |
| Edit own milestones | Blocked |
| Raise own SLA limit | Blocked |
| Edit own contract value | Blocked |
| Read credential table | Blocked at GRANT level |
| Legitimate own-tenant insert | Allowed |

---

## Deployment — Netlify

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "SolarSync: VybzTech client delivery portal"
git branch -M main
git remote add origin https://github.com/<your-org>/solarsync.git
git push -u origin main
```

Confirm `.env.local` is **not** in the commit — `.gitignore` already excludes it.

### 2. Connect the site

In Netlify: **Add new site → Import an existing project → GitHub → solarsync**.

`netlify.toml` supplies the build settings, so leave the UI fields at their defaults:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22 (pinned in `netlify.toml`)

### 3. Environment variables

**Site configuration → Environment variables** — add all three:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your publishable key |
| `VITE_CLIENT_SLUG` | `folivision` |

Vite inlines `VITE_*` variables at build time. **Adding or changing one requires a fresh deploy** — a rebuild, not just a cache clear.

### 4. SPA redirect

Already configured in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Without this, a hard refresh on `/requests` returns 404 because Netlify looks for a file that does not exist. Keep this as the **last** redirect rule so it never shadows a more specific one.

### 5. Post-deploy

Set the Edge Function CORS allow-list to your live origins:

```bash
supabase secrets set PORTAL_ALLOWED_ORIGINS="https://portal.vybztech.com,https://solarsync.netlify.app"
```

`localhost` and `127.0.0.1` are always permitted regardless of this list, so setting it does not break `npm run dev`. Any other origin gets an explicit `403` with a readable reason rather than a silent CORS failure.

Then in **Supabase → Authentication → URL Configuration**, add your Netlify URL and custom domain to **Redirect URLs**, or magic links will bounce.

### 6. Branded emails

Supabase's default auth emails are unbranded and send from `noreply@mail.app.supabase.io`. FoliVision-branded replacements are in [`supabase/email-templates/`](supabase/email-templates/) — see the README there for which template to paste where, and why a first-time sign-in sends the *Confirm signup* template rather than the *Magic Link* one.

---

## Backend management

Migrations live in `supabase/migrations/` and match what is applied to the project.

```bash
supabase link --project-ref <project-ref>
supabase db push                                    # apply migrations
supabase functions deploy pin-login --no-verify-jwt # deploy the login function
```

`--no-verify-jwt` is required and intentional: `pin-login` is an unauthenticated login endpoint that implements its own authentication.

### Day-to-day updates (Supabase Studio)

| Task | Where |
|---|---|
| Move a milestone to 80% | `project_milestones` → edit `progress_percentage` and `status` |
| Approve a change request | `change_requests` → set `status`, fill `resolution_notes` |
| Exempt a critical bug from the cap | `change_requests` → set `counts_toward_quota` to false |
| Publish a document | `resource_vault` → insert a row |
| Update environment health | `staging_environments` → edit `health` and `last_checked_at` |
| Move the UAT date | `clients` → edit `uat_review_at` |

Every one of these appears in an open browser within seconds — Realtime is enabled on all five tables.

### Rotate the client PIN

```sql
update public.client_access_codes
   set pin_hash = public.hash_client_pin('NEW_PIN'),
       failed_attempts = 0,
       locked_until = null
 where code = 'FOLIVISION';
```

### Clear a lockout early

```sql
update public.client_access_codes
   set failed_attempts = 0, locked_until = null
 where code = 'FOLIVISION';
```

### Grant someone magic-link access

```sql
insert into public.client_invitations (client_id, email, role, display_name)
select id, 'person@folivision.com', 'client', 'Full Name'
from public.clients where slug = 'folivision';
```

They receive access automatically on first sign-in.

---

## Onboarding a second client

1. Copy `supabase/migrations/20260728213224_06_seed_folivision_tenant.sql`, change the slug and data, and apply it.
2. Add an access code and invitations (see migration 07 as the template).
3. Either point a second Netlify site at the same repo with `VITE_CLIENT_SLUG=<new-slug>`, or leave it unset — a user with exactly one membership resolves to their own tenant automatically.

No application code changes are required.

---

## Accessibility

WCAG 2.1 AA verified by computed contrast ratio, not by eye. Tailwind's `slate-500` and `slate-600` fail against these dark surfaces (3.44:1 and 2.16:1), so the config defines solved `muted` tones that clear 4.5:1 on the lightest surface in use.

Also covered: keyboard focus rings, a skip-to-content link, `aria-live` toast announcements, labelled form controls with `aria-invalid` and `aria-describedby`, 40px minimum touch targets, `prefers-reduced-motion` support, and horizontal scroll containers for wide tables.

---

## Known placeholders

Swap these before sharing the portal externally:

- **Figma URLs** contain `PLACEHOLDER`. The embed deliberately refuses to render an iframe until a real `figma.com` HTTPS URL is set.
- **Resource vault URLs** point at `/vault/folivision/*.pdf`. Upload the documents to Supabase Storage or Netlify's `public/` folder and update the `url` column.
- **Client logo** — `clients.logo_url` is null; the inline SolarSync mark renders instead.
- **Staging domains** (`staging-app.folivision.com`) are illustrative.
- **The seeded PIN** is a first-issue credential. Rotate it before handover.

---

*VybzTech Inc. · No. 7, Akin Adeboyejo Close, Victory Estate, Idimu-Ejigbo, Lagos*
