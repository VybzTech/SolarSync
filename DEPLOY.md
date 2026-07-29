# SolarSync — deployment runbook

Everything below is in order. Do not skip step 3; it is the one that breaks people.

Total time: about 20 minutes.

---

## What you already have

| Thing | Value |
|---|---|
| Supabase project | `SolarSync` — ref `fadtwiggrwgslvskwnfl`, London (eu-west-2), free tier |
| Supabase URL | `https://fadtwiggrwgslvskwnfl.supabase.co` |
| Publishable key | `sb_publishable_rv_MuloXvlQyxv6sIvHssw_n-lfKf3V` |
| Edge Function | `pin-login` — deployed, v4, `verify_jwt` off |
| Migrations applied | 13 |
| Realtime | On for all 7 portal tables |

The publishable key is **meant** to be public. Every table is gated by Row Level Security, so without a valid session it returns zero rows.

---

## Login credentials

**Nothing to create. Both already exist.**

### Shared client login — give this to FoliVision

| Field | Value |
|---|---|
| Client ID | `FOLIVISION` |
| PIN | `704612` |

Paste those two lines into the WhatsApp group. Works on mobile and desktop, no email round-trip.

**Rotate the PIN before you share it externally.** Run this in Supabase → SQL Editor:

```sql
update public.client_access_codes
   set pin_hash = public.hash_client_pin('YOUR_NEW_PIN'),
       failed_attempts = 0,
       locked_until = null
 where code = 'FOLIVISION';
```

The PIN is bcrypt-hashed inside Postgres and never stored in plain text — which also means nobody, including you, can read it back. If you forget it, set a new one with the query above.

Five wrong attempts locks the code for 15 minutes. To clear a lockout early:

```sql
update public.client_access_codes
   set failed_attempts = 0, locked_until = null
 where code = 'FOLIVISION';
```

### Your admin login

`adedave77@gmail.com` via the **Email link** tab. Already on the allow-list.

To give someone else magic-link access:

```sql
insert into public.client_invitations (client_id, email, role, display_name)
select id, 'person@folivision.com', 'client', 'Full Name'
from public.clients where slug = 'folivision';
```

They get access automatically on first sign-in. An uninvited address can still request a link, but lands on "no workspace linked" because RLS returns nothing for them.

---

## Step 1 — Push to GitHub

```bash
cd "C:\Users\IT DIRECTORATE\Documents\GitHub\SolarSync"
git init
git add .
git commit -m "SolarSync: VybzTech client delivery portal"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/solarsync.git
git push -u origin main
```

Before pushing, confirm `.env.local` is **not** staged — `git status` should not list it. `.gitignore` already excludes it.

---

## Step 2 — Create the Netlify site

1. app.netlify.com → **Add new site** → **Import an existing project** → **GitHub** → pick `solarsync`
2. Leave every build field at its default. `netlify.toml` supplies build command (`npm run build`), publish directory (`dist`), Node 22, the SPA redirect and security headers.
3. Click **Deploy**.

The first build fails or shows a blank screen until step 3. That is expected.

---

## Step 3 — Environment variables (the one people skip)

**Site configuration → Environment variables → Add a variable → Add a single variable.** Add all three:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://fadtwiggrwgslvskwnfl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_rv_MuloXvlQyxv6sIvHssw_n-lfKf3V` |
| `VITE_CLIENT_SLUG` | `folivision` |

Then **Deploys → Trigger deploy → Deploy site**.

Vite bakes `VITE_*` variables into the bundle at build time. Adding them does nothing to an already-built site — you need a **fresh build**, not a cache clear. This is the single most common cause of a white screen on Netlify.

Note your live URL, e.g. `https://solarsync-folivision.netlify.app`. You need it in the next two steps.

---

## Step 4 — Point Supabase at your Netlify URL

Two settings, both required, both easy to miss.

### 4a. Redirect URLs (magic links break without this)

**Supabase → Authentication → URL Configuration**

- **Site URL**: your Netlify URL
- **Redirect URLs**: add both
  - `https://YOUR-SITE.netlify.app/**`
  - `http://localhost:5173/**`

The `/**` wildcard matters. Without it Supabase rejects the callback and the magic link dead-ends.

### 4b. CORS allow-list for the PIN endpoint

**Supabase → Edge Functions → Secrets** (or via CLI):

```bash
supabase secrets set PORTAL_ALLOWED_ORIGINS="https://YOUR-SITE.netlify.app"
```

`localhost` and `127.0.0.1` are always permitted in code, so setting this will not break local development. If you skip this entirely the function allows all origins — fine for now, worth setting before handover.

---

## Step 5 — Branded emails

**Supabase → Authentication → Emails**

### 5a. Turn off the confirmation step (recommended)

**Authentication → Sign In / Providers → Email → Confirm email → OFF**

Right now a first-time sign-in sends *Confirm signup* rather than *Magic Link* — that is why you saw "Confirm your email address". For a magic-link portal, receiving the email **is** proof of address ownership, so the extra step adds friction without adding security. Access control is RLS, not email confirmation.

### 5b. Paste the templates

| Supabase template | File in this repo | Subject to set |
|---|---|---|
| Magic Link | `supabase/email-templates/magic-link.html` | `Your SolarSync sign-in link` |
| Confirm signup | `supabase/email-templates/confirm-signup.html` | `Welcome to SolarSync — confirm your address` |

Open the file, copy everything, paste into **Message body (HTML)**, save. Leave `{{ .ConfirmationURL }}` exactly as written — Supabase substitutes it at send time.

Do both even if you turned confirmation off, so you are covered either way.

### 5c. Know the limit you are on

The default sender is `noreply@mail.app.supabase.io`, shared and rate-limited to a handful of emails per hour, and it lands in spam often enough to matter for a paying client.

For onboarding-period use with a WhatsApp group as the main channel, this is fine. Before FoliVision relies on email, set up custom SMTP under **Project Settings → Authentication → SMTP Settings** — Resend or Postmark, about 15 minutes including DNS.

---

## Step 6 — Test it

Work through these in order. Each one catches a different failure.

| # | Test | Expected | If it fails |
|---|---|---|---|
| 1 | Open your Netlify URL | Login screen, animated background, light theme | Blank page → step 3, env vars + fresh rebuild |
| 2 | Click the theme toggle | Flips to dark, no flash | — |
| 3 | Reload the page | Stays on the theme you chose | — |
| 4 | Sign in: `FOLIVISION` / `704612` | Lands on Overview | See "PIN troubleshooting" below |
| 5 | Navigate to `/milestones`, then **hard refresh** | Page still loads, no 404 | 404 → SPA redirect missing from `netlify.toml` |
| 6 | Click through all 5 tabs | Each renders with data | — |
| 7 | Sign out → **Email link** tab → your address | Branded email arrives | Check spam; confirm step 5b saved |
| 8 | Open the link from your phone | Signs in on the phone | Link dead-ends → step 4a redirect URLs |
| 9 | Submit a change request | Toast with a `FOLI-CR-00XX` reference; SLA counter goes 7 → 8 | — |
| 10 | In Supabase, edit a milestone's `progress_percentage` | Open browser updates within seconds, no refresh | Badge says "Offline" → realtime not connected |

### Test 10 is the one worth doing properly

It proves the whole live-update premise. Open the portal, then in **Supabase → Table Editor → project_milestones**, change `SolarmanV5 Data Pipeline` from `60` to `75` and save. Watch the browser — the bar moves on its own. That is what you are selling FoliVision.

### PIN troubleshooting

If step 4 fails, open the browser console (F12) first — the error now names the cause.

| Symptom | Cause | Fix |
|---|---|---|
| "Could not reach the sign-in service" | CORS | Add your Netlify URL to `PORTAL_ALLOWED_ORIGINS` (step 4b) |
| "not authorised to sign in" naming your origin | Origin not on the list | Same as above |
| "not recognised" | Wrong PIN, or it was rotated | Re-run the rotate query |
| "Too many failed attempts" | 5 wrong tries | Wait 15 min or run the unlock query |

Function logs: **Supabase → Edge Functions → pin-login → Logs**. Every request logs its origin and outcome.

---

## Running the portal day to day

All content edits happen in **Supabase → Table Editor**. No deploys, no code. Changes appear in any open browser within seconds.

| To do this | Edit this table |
|---|---|
| Move a milestone to 80% | `project_milestones` → `progress_percentage`, `status` |
| Advance the lifecycle stage | `sdlc_stages` → `status` (`Complete` / `Active` / `Upcoming`) |
| Mark a deliverable done | `deliverables` → `status` |
| Approve or reject a request | `change_requests` → `status`, `resolution_notes` |
| Exempt a critical bug from the 50/month cap | `change_requests` → `counts_toward_quota` = false |
| Publish a document | `resource_vault` → insert a row |
| Update staging health | `staging_environments` → `health`, `last_checked_at` |
| Move the UAT date | `clients` → `uat_review_at` |
| Change the invoice line | `clients` → `invoice_status` |

The SLA counter recalculates itself on every insert, update and delete — including when you reject a request, which removes it from the count. Never edit `sla_metrics.requests_used` by hand; it will be overwritten.

---

## Still placeholders

Swap these before the portal goes to FoliVision:

- **Figma URLs** contain `PLACEHOLDER` in `staging_environments` and `resource_vault`.
- **Document URLs** point at `/vault/folivision/*.pdf`. Upload the real files to Supabase Storage, or drop them in `public/vault/folivision/` and redeploy, then update the `url` column.
- **Staging domains** (`staging-app.folivision.com`) are illustrative.
- **The seeded PIN** — rotate it.

---

## Cost

Everything here is on free tiers: Supabase free (500 MB database, 50k monthly active users, 2 GB bandwidth) and Netlify free (100 GB bandwidth, 300 build minutes). A portal with a handful of users will not come close.

The one thing that will eventually cost money is custom SMTP, and only if you exceed the free tiers of Resend or Postmark — both of which are generous enough for this.
