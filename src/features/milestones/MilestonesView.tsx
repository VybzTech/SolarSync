import { useMemo } from 'react'
import { Target, Package } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LiveBadge } from '@/components/ui/LiveBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MilestoneList } from '@/features/dashboard/MilestoneList'
import { PhaseTimeline } from '@/features/dashboard/PhaseTimeline'
import { MILESTONE_TONES } from '@/lib/tokens'
import { formatCurrency } from '@/lib/format'
import { useDeliverables, useMilestones } from '@/hooks/usePortalData'
import { useTenant } from '@/providers/TenantProvider'
import type { Deliverable } from '@/types/domain'

function DeliverableTable({ deliverables }: { deliverables: Deliverable[] }) {
  const total = deliverables.reduce((sum, d) => sum + (d.cost ?? 0), 0)
  const currency = deliverables[0]?.currency ?? 'NGN'

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-2xs uppercase tracking-[0.1em] text-ink-3">
            <th scope="col" className="px-5 py-3 font-semibold">Deliverable</th>
            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
            <th scope="col" className="px-5 py-3 text-right font-semibold">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {deliverables.map((item) => {
            const tone = MILESTONE_TONES[item.status]
            return (
              <tr key={item.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{item.name}</p>
                  {item.justification ? (
                    <p className="mt-1 max-w-lg text-xs leading-relaxed text-ink-2">
                      {item.justification}
                    </p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <Badge tone={tone.chip} dot={tone.fill}>
                    {item.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs tabular-nums text-ink">
                  {item.cost === 0 ? 'Included' : formatCurrency(item.cost, item.currency)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-2 bg-raised">
            <td className="px-5 py-3.5 text-xs font-semibold text-ink" colSpan={2}>
              Phase 1 total
            </td>
            <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
              {formatCurrency(total, currency)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function MilestonesView() {
  const { client } = useTenant()
  const { data: milestones, loading, error, refresh, live } = useMilestones()
  const { data: deliverables, loading: loadingDeliverables } = useDeliverables()

  const overall = useMemo(
    () =>
      milestones.length > 0
        ? Math.round(
            milestones.reduce((sum, m) => sum + m.progress_percentage, 0) /
              milestones.length,
          )
        : 0,
    [milestones],
  )

  const delivered = deliverables
    .filter((d) => d.status === 'Completed')
    .reduce((sum, d) => sum + (d.cost ?? 0), 0)

  return (
    <>
      <PageHeader
        eyebrow="Scope"
        title="Milestones & deliverables"
        description="Every milestone in the Phase 1 plan, the deliverables attached to it, and the contracted value of each."
        action={
          <div className="rounded-xl border border-line bg-raised px-4 py-2.5 text-right shadow-inset">
            <p className="eyebrow">Delivered to date</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-ink">
              {formatCurrency(delivered, client?.currency ?? 'NGN')}
            </p>
          </div>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader
            eyebrow="Phase 1"
            title="Delivery milestones"
            action={<LiveBadge live={live} />}
          />
          {loading ? (
            <div className="px-5 py-5">
              <SkeletonRows rows={4} />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : milestones.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="No milestones published yet"
              description="Your delivery plan will appear here once published."
            />
          ) : (
            <>
              <div className="border-b border-line">
                <PhaseTimeline milestones={milestones} />
                <div className="flex items-center gap-3 px-5 pb-4">
                  <ProgressBar
                    value={overall}
                    fill="bg-brand-500"
                    label="Overall Phase 1 progress"
                    className="flex-1"
                  />
                  <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-ink-2">
                    {overall}%
                  </span>
                </div>
              </div>
              <MilestoneList milestones={milestones} />
            </>
          )}
        </Card>

        <Card>
          <CardHeader
            eyebrow="Commercial"
            title="Deliverable breakdown"
            description="Contracted scope and value per the Phase 1 cost analysis."
          />
          {loadingDeliverables ? (
            <div className="px-5 py-5">
              <SkeletonRows rows={3} />
            </div>
          ) : deliverables.length === 0 ? (
            <EmptyState
              icon={<Package className="h-5 w-5" />}
              title="No deliverables published"
            />
          ) : (
            <DeliverableTable deliverables={deliverables} />
          )}
        </Card>
      </div>
    </>
  )
}
