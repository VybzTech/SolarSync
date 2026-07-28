import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { PIN_LOGIN_ENDPOINT, supabase } from '@/lib/supabase'
import { env } from '@/lib/env'

interface AuthContextValue {
  session: Session | null
  /** True only until the initial session restore resolves. */
  initialising: boolean
  signInWithPin: (code: string, pin: string) => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Error carrying a message already safe to show a client. */
export class AuthError extends Error {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [initialising, setInitialising] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
      })
      .finally(() => {
        if (active) setInitialising(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Username + PIN sign-in.
   *
   * The PIN is never verified in the browser. It is posted to the pin-login
   * Edge Function, which compares a bcrypt hash inside Postgres and returns a
   * single-use token hash. Exchanging that token yields a genuine Supabase
   * session, so RLS applies identically to PIN and magic-link users.
   */
  const signInWithPin = useCallback(async (code: string, pin: string) => {
    let response: Response
    try {
      response = await fetch(PIN_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.supabaseAnonKey,
        },
        body: JSON.stringify({ code: code.trim(), pin: pin.trim() }),
      })
    } catch {
      throw new AuthError(
        'Could not reach the authentication service. Check your connection and try again.',
      )
    }

    let payload: {
      tokenHash?: string
      email?: string
      error?: string
    }
    try {
      payload = await response.json()
    } catch {
      throw new AuthError('Unexpected response from the authentication service.')
    }

    if (!response.ok || !payload.tokenHash || !payload.email) {
      throw new AuthError(payload.error ?? 'Sign-in failed. Please try again.')
    }

    const { error } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: payload.tokenHash,
    })

    if (error) {
      throw new AuthError('Your sign-in link could not be verified. Please try again.')
    }
  }, [])

  /** Passwordless email sign-in. */
  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) {
      throw new AuthError(
        error.message.toLowerCase().includes('rate')
          ? 'Too many requests. Please wait a minute before requesting another link.'
          : 'We could not send that link. Please check the address and try again.',
      )
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, initialising, signInWithPin, sendMagicLink, signOut }),
    [session, initialising, signInWithPin, sendMagicLink, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>.')
  }
  return context
}
