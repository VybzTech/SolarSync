/**
 * Domain model for the SolarSync portal.
 *
 * These types mirror the Postgres schema exactly. Enum unions are written by
 * hand rather than generated so the compiler fails loudly if the database
 * enums and the UI ever drift apart.
 */

export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Review' | 'Completed'

export type ChangeRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'

export type ChangeRequestKind = 'Feature' | 'Bug' | 'Enhancement'

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export type ResourceKind = 'PDF' | 'Link' | 'Figma' | 'Doc' | 'Image' | 'Archive'

export type EnvironmentHealth = 'Operational' | 'Degraded' | 'Down' | 'Unknown'

export type MemberRole = 'client' | 'admin'

export interface Client {
  id: string
  slug: string
  name: string
  legal_name: string | null
  engagement_title: string | null
  logo_url: string | null
  primary_color: string
  accent_color: string
  engagement_start: string | null
  uat_review_at: string | null
  contract_status: string | null
  invoice_status: string | null
  contract_value: number | null
  currency: string
  is_active: boolean
}

export interface ClientMember {
  id: string
  client_id: string
  user_id: string
  role: MemberRole
  display_name: string | null
}

export interface ProjectMilestone {
  id: string
  client_id: string
  phase_name: string
  description: string | null
  status: MilestoneStatus
  progress_percentage: number
  target_date: string | null
  started_date: string | null
  completed_date: string | null
  success_criteria: string | null
  sort_order: number
}

export interface ChangeRequest {
  id: string
  client_id: string
  reference: string
  title: string
  description: string
  kind: ChangeRequestKind
  severity: SeverityLevel
  status: ChangeRequestStatus
  submitted_by: string | null
  submitted_by_name: string | null
  submitted_date: string
  acknowledged_at: string | null
  resolved_at: string | null
  resolution_notes: string | null
  billing_period: string
  counts_toward_quota: boolean
}

export interface SlaMetrics {
  id: string
  client_id: string
  current_month: string
  requests_used: number
  requests_limit: number
  overage_rate: number
  currency: string
}

export interface SlaResponseTier {
  id: string
  client_id: string
  severity: SeverityLevel
  trigger_summary: string
  response_time: string
  resolution_target: string
  support_hours: string
  sort_order: number
}

export interface ResourceItem {
  id: string
  client_id: string
  document_name: string
  description: string | null
  url: string
  type: ResourceKind
  category: string | null
  version: string | null
  file_size: string | null
  is_confidential: boolean
  sort_order: number
}

export interface StagingEnvironment {
  id: string
  client_id: string
  label: string
  description: string | null
  url: string | null
  embed_url: string | null
  is_embed: boolean
  health: EnvironmentHealth
  health_note: string | null
  last_checked_at: string | null
  sort_order: number
}

export type StageStatus = 'Complete' | 'Active' | 'Upcoming'

export interface SdlcStage {
  id: string
  client_id: string
  name: string
  summary: string | null
  activities: string[]
  exit_criteria: string | null
  status: StageStatus
  duration: string | null
  sort_order: number
}

export interface Deliverable {
  id: string
  client_id: string
  milestone_id: string | null
  name: string
  justification: string | null
  cost: number | null
  currency: string
  status: MilestoneStatus
  sort_order: number
}

/** Payload accepted by the change request form. */
export interface NewChangeRequest {
  title: string
  description: string
  kind: ChangeRequestKind
  severity: SeverityLevel
}
