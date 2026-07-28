import { Activity } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { HEALTH_TONES } from '@/lib/tokens'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { StagingEnvironment } from '@/types/domain'

/**
 * Aggregate health strip. Values are read from staging_environments and are
 * maintained by the VybzTech team (or a scheduled health-check job writing
 * with the service role) rather than probed from the browser, which cannot
 * reach these hosts cross-origin anyway.
 */
export function ApiHealthStrip({
  environments,
}: {
  environments: StagingEnvironment[]
}) {
  const down = environments.filter((e) => e.health === 'Down').length
  const degraded = environments.filter((e) => e.health === 'Degraded').length

  const summary =
    down > 0
      ? { label: 'Service disruption', tone: HEALTH_TONES.Down }
      : degraded > 0
        ? { label: 'Partially degraded', tone: HEALTH_TONES.Degraded }
        : { label: 'All systems operational', tone: HEALTH_TONES.Operational }

  const lastChecked = environments
    .map((e) => e.last_checked_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)

  return (
    <Card>
      <CardHeader
        eyebrow="Pipeline"
        title="API status health check"
        action={
          <span className={cn('text-xs font-semibold', summary.tone.text)}>
            {summary.label}
          </span>
        }
      />
      <ul className="divide-y divide-hairline">
        {environments.map((environment) => {
          const tone = HEALTH_TONES[environment.health]
          return (
            <li
              key={environment.id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    tone.fill,
                    environment.health === 'Operational' && 'animate-pulse-dot',
                  )}
                  aria-hidden="true"
                />
                <span className="truncate text-sm text-slate-300">
                  {environment.label}
                </span>
              </div>
              <span className={cn('shrink-0 text-xs font-medium', tone.text)}>
                {environment.health}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex items-center gap-1.5 border-t border-hairline px-5 py-3 text-2xs text-muted">
        <Activity className="h-3 w-3" aria-hidden="true" />
        {lastChecked
          ? `Last status refresh ${formatRelative(lastChecked)}`
          : 'Awaiting first status refresh'}
      </div>
    </Card>
  )
}
