/**
 * Presentation helpers. All date handling is timezone-aware and defensive:
 * Postgres hands us ISO strings, and a malformed one should degrade to a
 * dash rather than render "Invalid Date" to a paying client.
 */

const WAT_TIME_ZONE = 'Africa/Lagos'

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  // Bare `YYYY-MM-DD` from a Postgres `date` column is parsed as UTC midnight
  // by the JS engine. Anchoring it to midday avoids the off-by-one-day error
  // that otherwise appears for users west of UTC.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: WAT_TIME_ZONE,
  }).format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: WAT_TIME_ZONE,
  }).format(date)
}

/** Compact relative time, e.g. "3 days ago", "just now". */
export function formatRelative(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'

  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(seconds)

  if (abs < 45) return 'just now'

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsPerUnit] of units) {
    if (abs >= secondsPerUnit) {
      return formatter.format(Math.round(seconds / secondsPerUnit), unit)
    }
  }
  return formatter.format(Math.round(seconds), 'second')
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'NGN',
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Month label for an SLA billing period, e.g. "July 2026". */
export function formatBillingPeriod(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * Which week of the engagement we are in, and how many there are in total.
 * Returns null when either boundary is unknown, so callers can hide the
 * indicator rather than render a misleading "Week 1 of 1".
 */
export function engagementWeek(
  startValue: string | null | undefined,
  endValue: string | null | undefined,
): { current: number; total: number } | null {
  const start = toDate(startValue)
  const end = toDate(endValue)
  if (!start || !end || end <= start) return null

  const WEEK_MS = 604_800_000
  const total = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / WEEK_MS))
  const elapsed = Math.floor((Date.now() - start.getTime()) / WEEK_MS) + 1

  return { current: Math.min(Math.max(elapsed, 1), total), total }
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '—'
}
