import { Check } from 'lucide-react'
import { MILESTONE_TONES } from '@/lib/tokens'
import { cn } from '@/lib/cn'
import type { ProjectMilestone } from '@/types/domain'

/**
 * Compact horizontal stepper across the delivery phases.
 *
 * The milestone list below it carries the detail; this exists purely to
 * answer "where are we?" without reading anything. Scrolls horizontally on
 * narrow screens rather than wrapping, so the sequence stays legible.
 */
export function PhaseTimeline({ milestones }: { milestones: ProjectMilestone[] }) {
  if (milestones.length === 0) return null

  return (
    <div className="overflow-x-auto px-5 py-5">
      <ol className="flex min-w-[34rem] items-start">
        {milestones.map((milestone, index) => {
          const tone = MILESTONE_TONES[milestone.status]
          const isDone = milestone.status === 'Completed'
          const isActive = milestone.status === 'In Progress' || milestone.status === 'Review'
          const isLast = index === milestones.length - 1

          return (
            <li key={milestone.id} className="flex flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {/* Left half of the connector */}
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full',
                      index === 0
                        ? 'bg-transparent'
                        : milestones[index - 1].status === 'Completed'
                          ? 'bg-emerald_brand-600'
                          : 'bg-white/[0.08]',
                    )}
                    aria-hidden="true"
                  />

                  <span
                    className={cn(
                      'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-bold',
                      isDone
                        ? 'bg-emerald_brand-600 text-white'
                        : isActive
                          ? 'bg-canvas-deep text-solar-300 ring-2 ring-solar-500'
                          : 'bg-canvas-deep text-muted ring-1 ring-hairline-strong',
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                    {isActive ? (
                      <span
                        className="absolute inset-0 animate-pulse-dot rounded-full ring-2 ring-solar-500/40"
                        aria-hidden="true"
                      />
                    ) : null}
                  </span>

                  {/* Right half of the connector */}
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full',
                      isLast
                        ? 'bg-transparent'
                        : isDone
                          ? 'bg-emerald_brand-600'
                          : 'bg-white/[0.08]',
                    )}
                    aria-hidden="true"
                  />
                </div>

                <p
                  className={cn(
                    'mt-2.5 line-clamp-2 px-1.5 text-center text-2xs leading-snug',
                    isDone || isActive ? 'text-slate-300' : 'text-muted',
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
