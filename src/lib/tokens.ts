import type {
  ChangeRequestKind,
  ChangeRequestStatus,
  EnvironmentHealth,
  MilestoneStatus,
  ResourceKind,
  SeverityLevel,
} from '@/types/domain'

/**
 * Single source of truth for status colour. Every badge, dot and progress bar
 * reads from here, so a status never renders two different colours in two
 * different views.
 *
 * Tailwind scans source files statically, so these must be complete literal
 * class strings — never interpolated fragments.
 */
export interface Tone {
  /** Badge / pill styling. */
  chip: string
  /** Solid fill for dots and progress bars. */
  fill: string
  /** Foreground text colour. */
  text: string
}

export const MILESTONE_TONES: Record<MilestoneStatus, Tone> = {
  Completed: {
    chip: 'bg-emerald_brand-500/15 text-emerald_brand-300 ring-1 ring-inset ring-emerald_brand-500/30',
    fill: 'bg-emerald_brand-500',
    text: 'text-emerald_brand-300',
  },
  'In Progress': {
    chip: 'bg-solar-500/15 text-solar-300 ring-1 ring-inset ring-solar-500/30',
    fill: 'bg-solar-500',
    text: 'text-solar-300',
  },
  Review: {
    chip: 'bg-vybz-500/15 text-vybz-400 ring-1 ring-inset ring-vybz-500/30',
    fill: 'bg-vybz-500',
    text: 'text-vybz-400',
  },
  'Not Started': {
    chip: 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/25',
    fill: 'bg-slate-600',
    text: 'text-slate-400',
  },
}

export const REQUEST_TONES: Record<ChangeRequestStatus, Tone> = {
  Completed: {
    chip: 'bg-emerald_brand-500/15 text-emerald_brand-300 ring-1 ring-inset ring-emerald_brand-500/30',
    fill: 'bg-emerald_brand-500',
    text: 'text-emerald_brand-300',
  },
  Approved: {
    chip: 'bg-vybz-500/15 text-vybz-400 ring-1 ring-inset ring-vybz-500/30',
    fill: 'bg-vybz-500',
    text: 'text-vybz-400',
  },
  'In Progress': {
    chip: 'bg-solar-500/15 text-solar-300 ring-1 ring-inset ring-solar-500/30',
    fill: 'bg-solar-500',
    text: 'text-solar-300',
  },
  Pending: {
    chip: 'bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-500/25',
    fill: 'bg-slate-500',
    text: 'text-slate-300',
  },
  Rejected: {
    chip: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
    fill: 'bg-rose-500',
    text: 'text-rose-300',
  },
}

export const SEVERITY_TONES: Record<SeverityLevel, Tone> = {
  Critical: {
    chip: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
    fill: 'bg-rose-500',
    text: 'text-rose-300',
  },
  High: {
    chip: 'bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-500/30',
    fill: 'bg-orange-500',
    text: 'text-orange-300',
  },
  Medium: {
    chip: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
    fill: 'bg-amber-500',
    text: 'text-amber-300',
  },
  Low: {
    chip: 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/25',
    fill: 'bg-slate-500',
    text: 'text-slate-400',
  },
}

export const HEALTH_TONES: Record<EnvironmentHealth, Tone> = {
  Operational: {
    chip: 'bg-emerald_brand-500/15 text-emerald_brand-300 ring-1 ring-inset ring-emerald_brand-500/30',
    fill: 'bg-emerald_brand-400',
    text: 'text-emerald_brand-300',
  },
  Degraded: {
    chip: 'bg-solar-500/15 text-solar-300 ring-1 ring-inset ring-solar-500/30',
    fill: 'bg-solar-500',
    text: 'text-solar-300',
  },
  Down: {
    chip: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
    fill: 'bg-rose-500',
    text: 'text-rose-300',
  },
  Unknown: {
    chip: 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/25',
    fill: 'bg-slate-600',
    text: 'text-slate-400',
  },
}

export const KIND_LABELS: Record<ChangeRequestKind, string> = {
  Feature: 'Feature request',
  Bug: 'Bug report',
  Enhancement: 'Enhancement',
}

export const RESOURCE_ACCENTS: Record<ResourceKind, string> = {
  PDF: 'text-rose-300 bg-rose-500/10 ring-rose-500/25',
  Doc: 'text-vybz-400 bg-vybz-500/10 ring-vybz-500/25',
  Figma: 'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/25',
  Link: 'text-sky-300 bg-sky-500/10 ring-sky-500/25',
  Image: 'text-emerald_brand-300 bg-emerald_brand-500/10 ring-emerald_brand-500/25',
  Archive: 'text-solar-300 bg-solar-500/10 ring-solar-500/25',
}
