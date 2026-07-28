import { ArrowUpRight, Radio } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { HEALTH_TONES } from '@/lib/tokens'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { StagingEnvironment } from '@/types/domain'

export function EnvironmentCard({ environment }: { environment: StagingEnvironment }) {
  const tone = HEALTH_TONES[environment.health]
  const isLive = environment.health === 'Operational'
  const hasLink = Boolean(environment.url)

  const body = (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge tone={tone.chip}>
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              tone.fill,
              isLive && 'animate-pulse-dot',
            )}
            aria-hidden="true"
          />
          {environment.health}
        </Badge>
        {hasLink ? (
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-muted transition group-hover:text-solar-400"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <h3 className="text-sm font-semibold text-slate-100">{environment.label}</h3>

      {environment.description ? (
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">
          {environment.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 space-y-1.5 border-t border-hairline pt-3">
        {environment.url ? (
          <p className="truncate font-mono text-2xs text-muted">
            {environment.url.replace(/^https?:\/\//, '')}
          </p>
        ) : null}
        <div className="flex items-center gap-1.5 text-2xs text-muted">
          <Radio className="h-3 w-3" aria-hidden="true" />
          <span>
            {environment.health_note ?? 'Status unavailable'}
            {environment.last_checked_at
              ? ` · checked ${formatRelative(environment.last_checked_at)}`
              : ''}
          </span>
        </div>
      </div>
    </div>
  )

  if (!hasLink) {
    return <Card className="h-full">{body}</Card>
  }

  return (
    <a
      href={environment.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-solar-500"
      aria-label={`Open ${environment.label} in a new tab`}
    >
      <Card interactive className="h-full">
        {body}
      </Card>
    </a>
  )
}
