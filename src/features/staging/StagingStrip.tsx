import { ArrowUpRight, Link2, Radio } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { HEALTH_TONES } from '@/lib/tokens'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useStagingEnvironments } from '@/hooks/usePortalData'
import type { StagingEnvironment } from '@/types/domain'

function EnvironmentTile({ environment }: { environment: StagingEnvironment }) {
  const tone = HEALTH_TONES[environment.health]
  const isLive = environment.health === 'Operational'
  const hasLink = Boolean(environment.url)

  const inner = (
    <div className="flex h-full flex-col rounded-xl border border-line bg-raised p-4 transition group-hover:border-line-2 group-hover:shadow-card">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <Badge tone={tone.chip}>
          <span
            className={cn('h-1.5 w-1.5 rounded-full', tone.fill, isLive && 'animate-pulse-dot')}
            aria-hidden="true"
          />
          {environment.health}
        </Badge>
        {hasLink ? (
          <ArrowUpRight
            className="h-3.5 w-3.5 shrink-0 text-ink-3 transition group-hover:text-fg-brand"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <p className="text-sm font-semibold leading-snug text-ink">{environment.label}</p>

      {environment.description ? (
        <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-2">
          {environment.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-2xs text-ink-3">
        <Radio className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {environment.health_note ?? 'Status unavailable'}
          {environment.last_checked_at
            ? ` · ${formatRelative(environment.last_checked_at)}`
            : ''}
        </span>
      </p>
    </div>
  )

  if (!hasLink) return <div className="h-full">{inner}</div>

  return (
    <a
      href={environment.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={`Open ${environment.label} in a new tab`}
    >
      {inner}
    </a>
  )
}

/**
 * Compact staging links for the Overview. Environments are few, so they earn
 * a card row rather than a dedicated tab.
 */
export function StagingStrip() {
  const { data: environments, loading, error } = useStagingEnvironments()
  const visible = environments.filter((e) => !e.is_embed)

  return (
    <Card>
      <CardHeader
        eyebrow="Environments"
        title="Staging & sublinks"
        description="Live builds and the upstream inverter data pipeline."
      />
      {loading ? (
        <div className="px-5 py-5">
          <SkeletonRows rows={2} />
        </div>
      ) : error || visible.length === 0 ? (
        <EmptyState
          icon={<Link2 className="h-5 w-5" />}
          title="No environments published"
          description="Staging links appear here as each environment is provisioned."
        />
      ) : (
        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((environment) => (
            <EnvironmentTile key={environment.id} environment={environment} />
          ))}
        </div>
      )}
    </Card>
  )
}
