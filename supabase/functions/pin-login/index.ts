// =====================================================================
// SolarSync :: pin-login
// ---------------------------------------------------------------------
// verify_jwt is intentionally DISABLED: this is an unauthenticated login
// endpoint. It implements its own authentication -- a bcrypt-hashed PIN
// verified inside Postgres, with a 5-attempt / 15-minute lockout.
//
// On success it mints a REAL Supabase session via admin.generateLink, so
// the browser ends up holding a genuine JWT and every RLS policy applies
// exactly as it would for a magic-link user. The service role key never
// leaves this function.
//
// Deploy:
//   supabase functions deploy pin-login --no-verify-jwt
// =====================================================================
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const ALLOWED_ORIGINS = (Deno.env.get('PORTAL_ALLOWED_ORIGINS') ?? '')
  .split(',').map((o) => o.trim()).filter(Boolean)

function corsHeaders(origin: string | null): Record<string, string> {
  // If no allow-list is configured, fall back to '*' so local development
  // works out of the box. Set PORTAL_ALLOWED_ORIGINS in production.
  const allow = ALLOWED_ORIGINS.length === 0
    ? '*'
    : origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

/** High-entropy password for the shadow user. Never used for sign-in --
 *  sessions are always minted through generateLink -- but the account must
 *  not be left with a guessable credential. */
function randomSecret(): string {
  const bytes = new Uint8Array(48)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  let code: unknown
  let pin: unknown
  try {
    const body = await req.json()
    code = body?.code
    pin = body?.pin
  } catch {
    return json({ error: 'Malformed request body.' }, 400, origin)
  }

  if (typeof code !== 'string' || typeof pin !== 'string') {
    return json({ error: 'Client ID and PIN are required.' }, 400, origin)
  }
  if (code.length > 32 || pin.length > 64) {
    return json({ error: 'Client ID and PIN are required.' }, 400, origin)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ---- 1. Verify the PIN inside Postgres -----------------------------
  const { data: result, error: rpcError } = await admin.rpc('verify_client_pin', {
    p_code: code, p_pin: pin,
  })

  if (rpcError) {
    console.error('verify_client_pin failed:', rpcError.message)
    return json({ error: 'Unable to verify credentials.' }, 500, origin)
  }

  if (!result?.ok) {
    if (result?.reason === 'locked') {
      const seconds = Number(result.retry_after_seconds ?? 900)
      const minutes = Math.max(1, Math.ceil(seconds / 60))
      return json({
        error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        locked: true, retryAfterSeconds: seconds,
      }, 429, origin)
    }
    return json({
      error: 'That Client ID and PIN combination was not recognised.',
      attemptsRemaining: result?.attempts_remaining ?? null,
    }, 401, origin)
  }

  const portalEmail = result.portal_email as string

  // ---- 2. Ensure the shadow auth user exists -------------------------
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: portalEmail,
    password: randomSecret(),
    email_confirm: true,
    user_metadata: {
      display_name: result.display_name ?? null,
      auth_method: 'client_pin',
    },
  })

  // A duplicate simply means the account was provisioned on an earlier login.
  const alreadyExists = createError &&
    (createError.status === 422 ||
      /already (been )?registered|already exists/i.test(createError.message))

  if (createError && !alreadyExists) {
    console.error('createUser failed:', createError.message)
    return json({ error: 'Unable to establish a session.' }, 500, origin)
  }

  // ---- 3. Guarantee tenant membership --------------------------------
  // The auth.users trigger handles this on first creation; we reconcile
  // explicitly so an account created outside the invitation flow still works.
  let userId = created?.user?.id ?? null
  if (!userId) {
    const { data: lookup } = await admin.schema('auth').from('users')
      .select('id').eq('email', portalEmail).maybeSingle()
    userId = lookup?.id ?? null
  }

  if (userId) {
    const { error: memberError } = await admin.from('client_members').upsert({
      client_id: result.client_id,
      user_id: userId,
      role: 'client',
      display_name: result.display_name ?? null,
    }, { onConflict: 'client_id,user_id', ignoreDuplicates: true })
    if (memberError) console.error('membership upsert failed:', memberError.message)
  }

  // ---- 4. Mint a real session ----------------------------------------
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink', email: portalEmail,
  })

  if (linkError || !link?.properties?.hashed_token) {
    console.error('generateLink failed:', linkError?.message)
    return json({ error: 'Unable to establish a session.' }, 500, origin)
  }

  return json({
    tokenHash: link.properties.hashed_token,
    email: portalEmail,
    displayName: result.display_name ?? null,
  }, 200, origin)
})
