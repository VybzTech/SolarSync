import { useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { SlaCounter } from './SlaCounter'
import { SlaTierTable } from './SlaTierTable'
import { RequestForm } from './RequestForm'
import { RequestTable } from './RequestTable'
import { cn } from '@/lib/cn'
import {
  useChangeRequests,
  useSlaMetrics,
  useSlaTiers,
} from '@/hooks/usePortalData'
import type { ChangeRequestStatus } from '@/types/domain'

type Filter = 'All' | ChangeRequestStatus

const FILTERS: Filter[] = ['All', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected']

export function RequestsView() {
  const { data: requests, loading, error, refresh } = useChangeRequests()
  const { data: slaRows } = useSlaMetrics()
  const { data: tiers } = useSlaTiers()
  const [filter, setFilter] = useState<Filter>('All')

  const metrics = slaRows[0]

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['All', requests.length]])
    for (const request of requests) {
      map.set(request.status, (map.get(request.status) ?? 0) + 1)
    }
    return map
  }, [requests])

  const visible = useMemo(
    () => (filter === 'All' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter],
  )

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Change requests & support"
        description="Submit feature requests and log issues against your monthly SLA allowance. Every submission is tracked end to end."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <RequestForm onSubmitted={refresh} />

          <Card>
            <CardHeader
              eyebrow="History"
              title="Submitted requests"
              action={
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
                  {FILTERS.filter((f) => f === 'All' || (counts.get(f) ?? 0) > 0).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFilter(option)}
                        aria-pressed={filter === option}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-2xs font-semibold transition',
                          filter === option
                            ? 'bg-emerald_brand-600 text-white'
                            : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200',
                        )}
                      >
                        {option}
                        <span className="ml-1 opacity-60">{counts.get(option) ?? 0}</span>
                      </button>
                    ),
                  )}
                </div>
              }
            />

            {loading ? (
              <div className="px-5 py-5">
                <SkeletonRows rows={4} />
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refresh} />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title={
                  requests.length === 0
                    ? 'No requests submitted yet'
                    : `No ${filter.toLowerCase()} requests`
                }
                description={
                  requests.length === 0
                    ? 'Use the form above to raise your first change request.'
                    : 'Try a different status filter.'
                }
              />
            ) : (
              <RequestTable requests={visible} />
            )}
          </Card>

          <SlaTierTable tiers={tiers} />
        </div>

        <div className="space-y-6">
          <SlaCounter metrics={metrics} />

          <Card>
            <CardHeader eyebrow="Reference" title="What counts as a request" />
            <div className="space-y-4 px-5 py-4 text-sm">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-emerald_brand-300">
                  Included in your allowance
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-400">
                  <li>UI changes, layout and visual refinements</li>
                  <li>Alert rules and threshold adjustments</li>
                  <li>Tariff rates and savings formula updates</li>
                  <li>Database columns and lookup tables</li>
                  <li>New inverter brands using existing logger APIs</li>
                </ul>
              </div>
              <div className="border-t border-hairline pt-3.5">
                <p className="mb-1.5 text-xs font-semibold text-solar-300">
                  Quoted separately
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-400">
                  <li>Major schema migrations or re-architecture</li>
                  <li>Disaster recovery redesign</li>
                  <li>Microservices migration or sharding</li>
                  <li>Multi-language localisation</li>
                </ul>
              </div>
              <p className="border-t border-hairline pt-3.5 text-2xs leading-relaxed text-muted">
                Maintenance window: Sundays 12:00 AM – 4:00 AM WAT, excluded from SLA
                obligations. Critical bugs are always prioritised above feature work.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
