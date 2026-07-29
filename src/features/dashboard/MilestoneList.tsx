import { CheckCircle2, Circle, CircleDot, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MILESTONE_TONES } from '@/lib/tokens'
import { formatDate } from '@/lib/format'
import type { MilestoneStatus, ProjectMilestone } from '@/types/domain'

const STATUS_ICONS: Record<MilestoneStatus, LucideIcon> = {
  Completed: CheckCircle2,
  'In Progress': CircleDot,
  Review: Eye,
  'Not Started': Circle,
}

export function MilestoneList({ milestones }: { milestones: ProjectMilestone[] }) {
  return (
    <ol className="divide-y divide-line">
      {milestones.map((milestone) => {
        const tone = MILESTONE_TONES[milestone.status]
        const Icon = STATUS_ICONS[milestone.status]

        return (
          <li key={milestone.id} className="px-5 py-4 transition hover:bg-raised/50">
            <div className="flex items-start gap-3.5">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                  <h3 className="text-sm font-semibold text-ink">{milestone.phase_name}</h3>
                  <div className="flex items-center gap-2.5">
                    <Badge tone={tone.chip} dot={tone.fill}>
                      {milestone.status}
                    </Badge>
                    <span className="font-mono text-xs font-semibold tabular-nums text-ink-2">
                      {milestone.progress_percentage}%
                    </span>
                  </div>
                </div>

                {milestone.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                    {milestone.description}
                  </p>
                ) : null}

                <ProgressBar
                  value={milestone.progress_percentage}
                  fill={tone.fill}
                  label={`${milestone.phase_name} progress`}
                  className="mt-3"
                />

                <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-2xs text-ink-3">
                  {milestone.started_date ? (
                    <span>Started {formatDate(milestone.started_date)}</span>
                  ) : null}
                  {milestone.completed_date ? (
                    <span className="font-medium text-fg-brand">
                      Completed {formatDate(milestone.completed_date)}
                    </span>
                  ) : milestone.target_date ? (
                    <span>Target {formatDate(milestone.target_date)}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
