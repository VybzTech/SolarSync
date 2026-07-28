/**
 * Environment access with fail-fast validation.
 *
 * A missing Supabase URL or key produces a blank white screen that is
 * miserable to debug in a Netlify preview. We surface it as an explicit,
 * readable error at module load instead.
 */

interface PortalEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  clientSlug: string
}

function read(key: string, fallback?: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined
  if (value && value.trim() !== '') return value.trim()
  if (fallback !== undefined) return fallback
  throw new Error(
    `[SolarSync] Missing required environment variable "${key}". ` +
      `Set it in .env.local for development, or under Site configuration > ` +
      `Environment variables in the Netlify dashboard for deployments.`,
  )
}

export const env: PortalEnv = {
  supabaseUrl: read('VITE_SUPABASE_URL'),
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY'),
  clientSlug: read('VITE_CLIENT_SLUG', 'folivision'),
}
