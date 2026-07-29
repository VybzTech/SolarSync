import { Check, CircleDot, Circle, GitBranch, Clock, Flag } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { STAGE_TONES } from '@/lib/tokens'
import { cn } from '@/lib/cn'
import { useSdlcStages } from '@/hooks/usePortalData'
import type { SdlcStage } from '@/types/domain'

const STAGE_ICONS = {
  Complete: Check,
  Active: CircleDot,
  Upcoming: Circle,
} as const

function StageRow({ stage, isLast }: { stage: SdlcStage; isLast: boolean }) {
  const tone = STAGE_TONES[stage.status]
  const Icon = STAGE_ICONS[stage.status]
  const isActive = stage.status === 'Active'

  return (
    <li className="relative flex gap-4 px-5 py-5">
      {/* Vertical rail */}
      {!isLast ? (
        <span
          className={cn(
            'absolute left-[2.4rem] top-[3.4rem] w-px',
            'bottom-0',
            stage.status === 'Complete' ? 'bg-brand-500/40' : 'bg-line',
          )}
          aria-hidden="true"
        />
      ) : null}

      <span
        className={cn(
          'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-card',
          stage.status === 'Complete'
            ? 'bg-brand-600 text-white'
            : isActive
              ? 'bg-card text-fg-warn ring-2 ring-solar-400'
              : 'bg-raised text-ink-3 ring-1 ring-line',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{stage.name}</h3>
          <div className="flex items-center gap-2">
            {stage.duration ? (
              <span className="inline-flex items-center gap-1 text-2xs text-ink-3">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {stage.duration}
              </span>
            ) : null}
            <Badge tone={tone.chip} dot={tone.fill}>
              {stage.status}
            </Badge>
          </div>
        </div>

        {stage.summary ? (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{stage.summary}</p>
        ) : null}

        {stage.activities.length > 0 ? (
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {stage.activities.map((activity) => (
              <li key={activity} className="flex items-start gap-2 text-xs text-ink-2">
                <span
                  className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', tone.fill)}
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{activity}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {stage.exit_criteria ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-raised px-3 py-2.5">
            <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-brand" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Exit criteria: </span>
              {stage.exit_criteria}
            </p>
          </div>
        ) : null}
      </div>
    </li>
  )
}

export function LifecycleView() {
  const { data: stages, loading, error, refresh, live } = useSdlcStages()

  const complete = stages.filter((s) => s.status === 'Complete').length
  const active = stages.find((s) => s.status === 'Active')

  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="SDLC lifecycle"
        description="How work moves from scope to handover. Delivery is Agile and sprint-based, with 3-week sprints and tri-weekly standups as set out in the BRD."
        action={
          active ? (
            <div className="rounded-xl border border-line bg-raised px-4 py-2.5 text-right shadow-inset">
              <p className="eyebrow">Currently in</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{active.name}</p>
            </div>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              eyebrow="Delivery process"
              title="Lifecycle stages"
              action={<LiveBadge live={live} />}
            />
            {loading ? (
              <div className="px-5 py-5">
                <SkeletonRows rows={4} />
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refresh} />
            ) : stages.length === 0 ? (
              <EmptyState
                icon={<GitBranch className="h-5 w-5" />}
                title="Lifecycle not published"
                description="The delivery process will appear here once published."
              />
            ) : (
              <ol className="divide-y divide-line">
                {stages.map((stage, index) => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    isLast={index === stages.length - 1}
                  />
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader eyebrow="At a glance" title="Progress through the lifecycle" />
            <div className="px-5 py-5">
              <p className="text-3xl font-semibold tracking-tight text-ink">
                {complete}
                <span className="text-ink-3"> of {stages.length || 6}</span>
              </p>
              <p className="mt-1 text-sm text-ink-2">stages complete</p>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Cadence" title="How we work" />
            <dl className="divide-y divide-line text-sm">
              {[
                ['Methodology', 'Agile, sprint-based SDLC'],
                ['Sprint length', '3 weeks'],
                ['Standups', 'Tri-weekly'],
                ['Emergency changes', 'Reviewed within 1 day'],
                ['Standard changes', 'Reviewed in 3–5 days'],
                ['Quality gate', 'Zero critical bugs before UAT'],
                ['Maintenance window', 'Sundays 12–4 AM WAT'],
              ].map(([term, detail]) => (
                <div key={term} className="flex items-start justify-between gap-4 px-5 py-3">
                  <dt className="text-xs text-ink-3">{term}</dt>
                  <dd className="text-right text-xs font-medium text-ink">{detail}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  )
}
