import { Check } from 'lucide-react'
import { MILESTONE_TONES } from '@/lib/tokens'
import { cn } from '@/lib/cn'
import type { ProjectMilestone } from '@/types/domain'

/**
 * Compact horizontal stepper across the delivery phases.
 *
 * The milestone list below carries the detail; this exists purely to answer
 * "where are we?" without reading anything. Scrolls horizontally on narrow
 * screens rather than wrapping, so the sequence stays legible.
 */
export function PhaseTimeline({ milestones }: { milestones: ProjectMilestone[] }) {
  if (milestones.length === 0) return null

  return (
    <div className="overflow-x-auto px-5 py-5">
      <ol className="flex min-w-[34rem] items-start">
        {milestones.map((milestone, index) => {
          const tone = MILESTONE_TONES[milestone.status]
          const isDone = milestone.status === 'Completed'
          const isActive =
            milestone.status === 'In Progress' || milestone.status === 'Review'
          const isLast = index === milestones.length - 1

          return (
            <li key={milestone.id} className="flex flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full',
                      index === 0
                        ? 'bg-transparent'
                        : milestones[index - 1].status === 'Completed'
                          ? 'bg-brand-500'
                          : 'bg-line',
                    )}
                    aria-hidden="true"
                  />

                  <span
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xs font-bold shadow-card',
                      isDone
                        ? 'bg-brand-600 text-white'
                        : isActive
                          ? 'bg-card text-fg-warn ring-2 ring-solar-400'
                          : 'bg-raised text-ink-3 ring-1 ring-line',
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>

                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full',
                      isLast ? 'bg-transparent' : isDone ? 'bg-brand-500' : 'bg-line',
                    )}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className={cn(
                    'mt-2.5 line-clamp-2 px-1.5 text-center text-2xs leading-snug',
                    isDone || isActive ? 'font-medium text-ink' : 'text-ink-3',
                  )}
                >
                  {milestone.phase_name}
                </p>
                <p className={cn('mt-0.5 font-mono text-2xs tabular-nums', tone.text)}>
                  {milestone.progress_percentage}%
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
