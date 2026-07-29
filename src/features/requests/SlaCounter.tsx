import { AlertTriangle, Gauge } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatBillingPeriod, formatCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { SlaMetrics } from '@/types/domain'

export function SlaCounter({ metrics }: { metrics: SlaMetrics | undefined }) {
  const used = metrics?.requests_used ?? 0
  const limit = metrics?.requests_limit ?? 50
  const remaining = Math.max(limit - used, 0)
  const ratio = limit > 0 ? used / limit : 0
  const overage = Math.max(used - limit, 0)

  // Amber at 70% consumed, red once the cap is breached.
  const state =
    ratio >= 1
      ? { fill: 'bg-fg-danger', text: 'text-fg-danger' }
      : ratio >= 0.7
        ? { fill: 'bg-solar-400', text: 'text-fg-warn' }
        : { fill: 'bg-brand-500', text: 'text-fg-brand' }

  return (
    <Card className="relative overflow-hidden" sheen>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(24rem 14rem at 92% -30%, rgba(0,104,55,0.18), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="relative px-5 py-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-fg-brand">
            <Gauge className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">Monthly SLA allowance</p>
            <p className="text-sm font-semibold text-ink">
              {formatBillingPeriod(metrics?.current_month)}
            </p>
          </div>
        </div>

        <p className="text-3xl font-bold tracking-tight text-white">
          <span className={cn('tabular-nums', state.text)}>{used}</span>
          <span className="text-ink-3"> of </span>
          <span className="tabular-nums">{limit}</span>
        </p>
        <p className="mt-1 text-sm text-ink-2">SLA change requests used</p>

        <ProgressBar
          value={ratio * 100}
          fill={state.fill}
          label="SLA allowance consumed"
          className="mt-4"
        />

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-ink-2">
            {remaining} request{remaining === 1 ? '' : 's'} remaining
          </span>
          <span className="text-ink-3">
            {Math.round(ratio * 100)}% consumed
          </span>
        </div>

        {overage > 0 ? (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-lg bg-tint-danger px-3.5 py-3 ring-1 ring-inset ring-fg-danger/20"
            role="status"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-fg-danger"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-fg-danger">
              <span className="font-semibold">
                {overage} request{overage === 1 ? '' : 's'} over the monthly cap.
              </span>{' '}
              Additional requests are billed at{' '}
              {formatCurrency(metrics?.overage_rate ?? 10000, metrics?.currency ?? 'NGN')}{' '}
              each per the Maintenance Framework.
            </p>
          </div>
        ) : ratio >= 0.7 ? (
          <p className="mt-4 rounded-lg bg-tint-warn px-3.5 py-3 text-xs leading-relaxed text-fg-warn ring-1 ring-inset ring-fg-warn/20">
            You are approaching the monthly cap. Requests beyond {limit} are billed at{' '}
            {formatCurrency(metrics?.overage_rate ?? 10000, metrics?.currency ?? 'NGN')} each.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
