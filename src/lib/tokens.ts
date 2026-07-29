import type {
  ChangeRequestKind,
  ChangeRequestStatus,
  EnvironmentHealth,
  MilestoneStatus,
  ResourceKind,
  SeverityLevel,
} from '@/types/domain'

/**
 * Single source of truth for status colour.
 *
 * Every value is a theme-aware semantic token (fg-*, tint-*) rather than a
 * fixed brand hex. Brand orange on a white card is 1.8:1 — unreadable — so
 * status *text* must flip with the theme even though brand *fills* do not.
 *
 * Tailwind scans statically, so these must be complete literal class
 * strings, never interpolated fragments.
 */
export interface Tone {
  /** Badge / pill styling. */
  chip: string
  /** Solid fill for dots, bars and progress. */
  fill: string
  /** Foreground text colour. */
  text: string
}

const BRAND: Tone = {
  chip: 'bg-tint-brand text-fg-brand ring-1 ring-inset ring-fg-brand/20',
  fill: 'bg-brand-500',
  text: 'text-fg-brand',
}

const WARN: Tone = {
  chip: 'bg-tint-warn text-fg-warn ring-1 ring-inset ring-fg-warn/20',
  fill: 'bg-solar-400',
  text: 'text-fg-warn',
}

const INFO: Tone = {
  chip: 'bg-tint-info text-fg-info ring-1 ring-inset ring-fg-info/20',
  fill: 'bg-info-500',
  text: 'text-fg-info',
}

const DANGER: Tone = {
  chip: 'bg-tint-danger text-fg-danger ring-1 ring-inset ring-fg-danger/20',
  fill: 'bg-fg-danger',
  text: 'text-fg-danger',
}

const NEUTRAL: Tone = {
  chip: 'bg-tint-neutral text-ink-3 ring-1 ring-inset ring-line-2',
  fill: 'bg-ink-3',
  text: 'text-ink-3',
}

export const MILESTONE_TONES: Record<MilestoneStatus, Tone> = {
  Completed: BRAND,
  'In Progress': WARN,
  Review: INFO,
  'Not Started': NEUTRAL,
}

export const REQUEST_TONES: Record<ChangeRequestStatus, Tone> = {
  Completed: BRAND,
  Approved: INFO,
  'In Progress': WARN,
  Pending: NEUTRAL,
  Rejected: DANGER,
}

export const SEVERITY_TONES: Record<SeverityLevel, Tone> = {
  Critical: DANGER,
  High: WARN,
  Medium: INFO,
  Low: NEUTRAL,
}

export const HEALTH_TONES: Record<EnvironmentHealth, Tone> = {
  Operational: BRAND,
  Degraded: WARN,
  Down: DANGER,
  Unknown: NEUTRAL,
}

export const STAGE_TONES = {
  Complete: BRAND,
  Active: WARN,
  Upcoming: NEUTRAL,
} as const

export const KIND_LABELS: Record<ChangeRequestKind, string> = {
  Feature: 'Feature request',
  Bug: 'Bug report',
  Enhancement: 'Enhancement',
}

export const RESOURCE_ACCENTS: Record<ResourceKind, string> = {
  PDF: 'text-fg-danger bg-tint-danger ring-fg-danger/15',
  Doc: 'text-fg-info bg-tint-info ring-fg-info/15',
  Figma: 'text-fg-brand bg-tint-brand ring-fg-brand/15',
  Link: 'text-fg-info bg-tint-info ring-fg-info/15',
  Image: 'text-fg-brand bg-tint-brand ring-fg-brand/15',
  Archive: 'text-fg-warn bg-tint-warn ring-fg-warn/15',
}
