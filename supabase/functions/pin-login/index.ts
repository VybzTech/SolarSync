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
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

/** Local development origins are always permitted. Without this, setting
 *  PORTAL_ALLOWED_ORIGINS to production URLs silently breaks `npm run dev`,
 *  because the browser blocks the response before any code here runs. */
function isLoopback(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  } catch {
    return false
  }
}

function isAllowed(origin: string | null): boolean {
  if (!origin) return true // non-browser client (curl, server-to-server)
  if (isLoopback(origin)) return true
  if (ALLOWED_ORIGINS.length === 0) return true
  return ALLOWED_ORIGINS.includes(origin.replace(/\/$/, ''))
}

/** Always echo the caller's own origin. Returning a DIFFERENT origin makes
 *  the browser discard the response, so a rejected caller could never read
 *  the reason it was rejected. We gate with a 403 status instead. */
function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
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
  console.log(
    `pin-login ${req.method} origin=${origin ?? '(none)'} allowlist=[${ALLOWED_ORIGINS.join(' ')}]`,
  )

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin)
  }

  if (!isAllowed(origin)) {
    console.warn(`blocked origin: ${origin}`)
    return json(
      {
        error:
          `This origin (${origin}) is not authorised to sign in. ` +
          `Add it to PORTAL_ALLOWED_ORIGINS in your Supabase function secrets.`,
      },
      403,
      origin,
    )
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in function env.')
    return json({ error: 'Authentication service is misconfigured.' }, 500, origin)
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
    p_code: code,
    p_pin: pin,
  })

  if (rpcError) {
    console.error('verify_client_pin failed:', rpcError.message, rpcError.details ?? '')
    return json({ error: 'Unable to verify credentials.' }, 500, origin)
  }

  if (!result?.ok) {
    console.log(`verification rejected: ${result?.reason ?? 'unknown'}`)
    if (result?.reason === 'locked') {
      const seconds = Number(result.retry_after_seconds ?? 900)
      const minutes = Math.max(1, Math.ceil(seconds / 60))
      return json(
        {
          error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
          locked: true,
          retryAfterSeconds: seconds,
        },
        429,
        origin,
      )
    }
    return json(
      {
        error: 'That Client ID and PIN combination was not recognised.',
        attemptsRemaining: result?.attempts_remaining ?? null,
      },
      401,
      origin,
    )
  }

  const portalEmail = result.portal_email as string

  // ---- 2. Resolve the shadow auth user -------------------------------
  // Looked up through a service-role RPC: PostgREST does not expose the
  // `auth` schema, so querying auth.users directly always fails.
  let userId: string | null = null

  const { data: foundId, error: lookupError } = await admin.rpc('find_auth_user_id', {
    p_email: portalEmail,
  })

  if (lookupError) {
    console.warn('find_auth_user_id failed:', lookupError.message)
  } else {
    userId = (foundId as string | null) ?? null
  }

  if (!userId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: portalEmail,
      password: randomSecret(),
      email_confirm: true,
      user_metadata: {
        display_name: result.display_name ?? null,
        auth_method: 'client_pin',
      },
    })

    if (createError) {
      const duplicate =
        createError.status === 422 ||
        /already (been )?registered|already exists|duplicate/i.test(createError.message)

      if (!duplicate) {
        console.error('createUser failed:', createError.status, createError.message)
        return json({ error: 'Unable to establish a session.' }, 500, origin)
      }
      console.log('user already existed, continuing')
    }
    userId = created?.user?.id ?? null
  }

  // ---- 3. Guarantee tenant membership --------------------------------
  if (userId) {
    const { error: memberError } = await admin
      .from('client_members')
      .upsert(
        {
          client_id: result.client_id,
          user_id: userId,
          role: 'client',
          display_name: result.display_name ?? null,
        },
        { onConflict: 'client_id,user_id', ignoreDuplicates: true },
      )
    if (memberError) console.error('membership upsert failed:', memberError.message)
  } else {
    console.warn('could not resolve a user id for', portalEmail)
  }

  // ---- 4. Mint a real session ----------------------------------------
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: portalEmail,
  })

  if (linkError || !link?.properties?.hashed_token) {
    console.error('generateLink failed:', linkError?.status, linkError?.message)
    return json({ error: 'Unable to establish a session.' }, 500, origin)
  }

  console.log('pin-login success for', portalEmail)
  return json(
    {
      tokenHash: link.properties.hashed_token,
      email: portalEmail,
      displayName: result.display_name ?? null,
    },
    200,
    origin,
  )
})
