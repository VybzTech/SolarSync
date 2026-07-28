import { useCallback, useEffect, useRef, useState } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface QueryState<T> {
  data: T[]
  loading: boolean
  error: string | null
  refresh: () => void
}

type QueryBuilder<T> = () => PromiseLike<{
  data: T[] | null
  error: PostgrestError | null
}>

/**
 * Generic table reader with optional realtime invalidation.
 *
 * Guards against two classic React data-fetching bugs:
 *  - setState after unmount (tracked via a mounted ref)
 *  - out-of-order responses overwriting newer data (tracked via a request id)
 */
export function useSupabaseQuery<T>(
  build: QueryBuilder<T>,
  deps: unknown[],
  options?: { realtimeTable?: string; enabled?: boolean },
): QueryState<T> {
  const enabled = options?.enabled ?? true
  const realtimeTable = options?.realtimeTable

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const mounted = useRef(true)
  const requestId = useRef(0)
  const buildRef = useRef(build)
  buildRef.current = build

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setData([])
      setLoading(false)
      return
    }

    const id = ++requestId.current
    setLoading(true)
    setError(null)

    Promise.resolve(buildRef.current()).then(({ data: rows, error: queryError }) => {
      // Ignore a response that a newer request has already superseded.
      if (!mounted.current || id !== requestId.current) return

      if (queryError) {
        setError('Unable to load this section. Please refresh and try again.')
        setData([])
      } else {
        setData(rows ?? [])
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps])

  // Realtime: any write to the table re-runs the query. Volumes here are tiny
  // (tens of rows), so a refetch is simpler and safer than patching in place.
  useEffect(() => {
    if (!enabled || !realtimeTable) return

    const channel = supabase
      .channel(`solarsync:${realtimeTable}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: realtimeTable },
        () => refresh(),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, realtimeTable, refresh])

  return { data, loading, error, refresh }
}
