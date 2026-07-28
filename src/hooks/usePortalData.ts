import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/providers/TenantProvider'
import { useSupabaseQuery } from './useSupabaseQuery'
import type {
  ChangeRequest,
  NewChangeRequest,
  ProjectMilestone,
  ResourceItem,
  SlaMetrics,
  SlaResponseTier,
  StagingEnvironment,
} from '@/types/domain'

export function useMilestones() {
  const { client } = useTenant()
  return useSupabaseQuery<ProjectMilestone>(
    () =>
      supabase
        .from('project_milestones')
        .select('*')
        .order('sort_order', { ascending: true }),
    [client?.id],
    { enabled: Boolean(client), realtimeTable: 'project_milestones' },
  )
}

export function useChangeRequests() {
  const { client } = useTenant()
  return useSupabaseQuery<ChangeRequest>(
    () =>
      supabase
        .from('change_requests')
        .select('*')
        .order('submitted_date', { ascending: false }),
    [client?.id],
    { enabled: Boolean(client), realtimeTable: 'change_requests' },
  )
}

export function useSlaMetrics() {
  const { client } = useTenant()
  return useSupabaseQuery<SlaMetrics>(
    () =>
      supabase
        .from('sla_metrics')
        .select('*')
        .order('current_month', { ascending: false }),
    [client?.id],
    { enabled: Boolean(client), realtimeTable: 'sla_metrics' },
  )
}

export function useSlaTiers() {
  const { client } = useTenant()
  return useSupabaseQuery<SlaResponseTier>(
    () =>
      supabase
        .from('sla_response_tiers')
        .select('*')
        .order('sort_order', { ascending: true }),
    [client?.id],
    { enabled: Boolean(client) },
  )
}

export function useResources() {
  const { client } = useTenant()
  return useSupabaseQuery<ResourceItem>(
    () =>
      supabase
        .from('resource_vault')
        .select('*')
        .order('sort_order', { ascending: true }),
    [client?.id],
    { enabled: Boolean(client), realtimeTable: 'resource_vault' },
  )
}

export function useStagingEnvironments() {
  const { client } = useTenant()
  return useSupabaseQuery<StagingEnvironment>(
    () =>
      supabase
        .from('staging_environments')
        .select('*')
        .order('sort_order', { ascending: true }),
    [client?.id],
    { enabled: Boolean(client), realtimeTable: 'staging_environments' },
  )
}

/**
 * Submits a change request.
 *
 * client_id and submitted_by are set here to satisfy the INSERT policy's
 * WITH CHECK clause. They are not a trust boundary: if either is tampered
 * with, Postgres rejects the row.
 */
export function useSubmitChangeRequest() {
  const { client, membership } = useTenant()

  return useCallback(
    async (payload: NewChangeRequest): Promise<ChangeRequest> => {
      if (!client) throw new Error('No active client engagement.')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Your session has expired. Please sign in again.')

      const { data, error } = await supabase
        .from('change_requests')
        .insert({
          client_id: client.id,
          title: payload.title.trim(),
          description: payload.description.trim(),
          kind: payload.kind,
          severity: payload.severity,
          status: 'Pending',
          submitted_by: user.id,
          submitted_by_name:
            membership?.display_name ?? user.email ?? 'Client',
        })
        .select()
        .single()

      if (error) {
        throw new Error(
          error.code === '42501'
            ? 'You do not have permission to submit requests for this engagement.'
            : 'We could not submit your request. Please try again.',
        )
      }

      return data as ChangeRequest
    },
    [client, membership],
  )
}
