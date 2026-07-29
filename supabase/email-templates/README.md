# Email templates

FoliVision-branded replacements for Supabase's default auth emails.

## Apply them

**Supabase dashboard → Authentication → Emails → Templates**

| Template in Supabase | File | Subject line to set |
|---|---|---|
| Magic Link | `magic-link.html` | `Your SolarSync sign-in link` |
| Confirm signup | `confirm-signup.html` | `Welcome to SolarSync — confirm your address` |

Paste the file contents into the **Message body (HTML)** field and save. Supabase substitutes `{{ .ConfirmationURL }}` at send time — leave it exactly as written.

## Why you saw "Confirm your email address"

Your auth log shows the first email sent was `mail_type: confirmation`, not `magic_link`. When **Confirm email** is enabled and the address has never signed in, Supabase sends the *Confirm signup* template rather than the *Magic Link* one — so customising only the magic-link template would appear to do nothing on a first sign-in.

Two options:

**Keep confirmation on** — customise both templates (both are provided here). First-time users get a welcome email, returning users get the sign-in link.

**Turn confirmation off** (recommended for a magic-link portal) — **Authentication → Sign In / Providers → Email → Confirm email → off**. Receiving the email *is* the proof of address ownership, so a separate confirmation step adds friction without adding security. Every sign-in then uses the Magic Link template.

Access is still controlled: an uninvited address can authenticate but lands on the "no workspace linked" screen, because RLS returns zero rows without a `client_members` entry.

## Before sharing this with FoliVision

The default sender is `noreply@mail.app.supabase.io` on a shared, rate-limited service — roughly a handful of emails per hour, and it will land in spam often enough to matter for a paying client.

Configure custom SMTP under **Project Settings → Authentication → SMTP Settings** so mail sends from your own domain (`portal@vybztech.com`). Resend, Postmark and Amazon SES all work; you will need SPF and DKIM records on the sending domain for reliable delivery.

Rate limits sit under **Authentication → Rate Limits** and default to a low ceiling on the shared sender. Raise the email limit once your own SMTP is connected.

## Editing

These are table-based layouts with fully inline styles. Outlook and Gmail strip `<style>` blocks and support neither flexbox nor grid, so keep any changes in the same idiom — nested `<table>` for structure, `style="..."` on every element.

Brand colours used: `#006837` emerald, `#FBB040` solar orange, `#0F172A` slate.
