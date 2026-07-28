import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Single shared Supabase browser client.
 *
 * This carries the publishable (anon) key only. Every read is gated by Row
 * Level Security server-side, so the key being public is expected and safe:
 * without a valid session it resolves to zero rows on every table.
 */
export const supabase: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'solarsync.auth',
    },
    global: {
      headers: { 'x-application-name': 'solarsync-portal' },
    },
  },
)

/** Absolute URL of the pin-login Edge Function. */
export const PIN_LOGIN_ENDPOINT = `${env.supabaseUrl}/functions/v1/pin-login`
