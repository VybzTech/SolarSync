import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import { useAuth } from './AuthProvider'
import type { Client, ClientMember } from '@/types/domain'

interface TenantContextValue {
  client: Client | null
  membership: ClientMember | null
  loading: boolean
  /** Set when the user authenticated but belongs to no tenant. */
  accessDenied: boolean
  error: string | null
  refresh: () => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

/**
 * Resolves which client engagement the signed-in user belongs to.
 *
 * RLS already guarantees a user can only see their own tenant, so this query
 * is a convenience rather than a security boundary. VITE_CLIENT_SLUG lets a
 * single codebase be deployed per-client on separate domains; when the user
 * has exactly one membership we fall back to it regardless of the slug.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [membership, setMembership] = useState<ClientMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!session) {
      setClient(null)
      setMembership(null)
      setAccessDenied(false)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    ;(async () => {
      const { data: memberships, error: memberError } = await supabase
        .from('client_members')
        .select('id, client_id, user_id, role, display_name')

      if (!active) return

      if (memberError) {
        setError('We could not load your workspace. Please try again.')
        setLoading(false)
        return
      }

      if (!memberships || memberships.length === 0) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('*')

      if (!active) return

      if (clientError || !clients || clients.length === 0) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      const resolved =
        clients.find((c) => c.slug === env.clientSlug) ?? clients[0]
      const resolvedMembership =
        memberships.find((m) => m.client_id === resolved.id) ?? memberships[0]

      setClient(resolved as Client)
      setMembership(resolvedMembership as ClientMember)
      setAccessDenied(false)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [session, nonce])

  const value = useMemo(
    () => ({ client, membership, loading, accessDenied, error, refresh }),
    [client, membership, loading, accessDenied, error, refresh],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a <TenantProvider>.')
  }
  return context
}
