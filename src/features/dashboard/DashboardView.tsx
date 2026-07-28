import { FileSignature, GaugeCircle, Receipt, TrendingUp, Layers } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CountdownCard } from './CountdownCard'
import { MilestoneList } from './MilestoneList'
import { StatWidget } from './StatWidgets'
import { useMilestones, useSlaMetrics } from '@/hooks/usePortalData'
import { useTenant } from '@/providers/TenantProvider'
import { formatCurrency, formatDate } from '@/lib/format'

export function DashboardView() {
  const { client } = useTenant()
  const { data: milestones, loading, error, refresh } = useMilestones()
  const { data: slaRows } = useSlaMetrics()

  const sla = slaRows[0]

  // Overall delivery is the mean of milestone progress — every phase in the
  // BRD table carries comparable weight, so an unweighted mean is honest.
  const overall =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((sum, m) => sum + m.progress_percentage, 0) /
            milestones.length,
        )
      : 0

  const completed = milestones.filter((m) => m.status === 'Completed').length

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={client ? `${client.name} delivery dashboard` : 'Delivery dashboard'}
        description={
          client?.engagement_title
            ? `${client.engagement_title}. Milestone progress updates in real time as the VybzTech team advances each phase.`
            : 'Milestone progress updates in real time.'
        }
      />

      {/* Quick status */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatWidget
          icon={<TrendingUp className="h-4 w-4" />}
          label="Overall progress"
          value={`${overall}%`}
          detail={`${completed} of ${milestones.length} milestones complete`}
          accent="emerald"
        />
        <StatWidget
          icon={<GaugeCircle className="h-4 w-4" />}
          label="SLA requests"
          value={sla ? `${sla.requests_used} of ${sla.requests_limit}` : '—'}
          detail={
            sla
              ? `${Math.max(sla.requests_limit - sla.requests_used, 0)} remaining this month`
              : 'No allocation recorded'
          }
          accent="solar"
        />
        <StatWidget
          icon={<FileSignature className="h-4 w-4" />}
          label="Contract status"
          value={client?.contract_status ?? '—'}
          detail={
            client?.engagement_start
              ? `Engagement began ${formatDate(client.engagement_start)}`
              : undefined
          }
          accent="vybz"
        />
        <StatWidget
          icon={<Receipt className="h-4 w-4" />}
          label="Phase value"
          value={formatCurrency(client?.contract_value, client?.currency ?? 'NGN')}
          detail={client?.invoice_status ?? undefined}
          accent="neutral"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Milestones */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              eyebrow="Phase 1"
              title="Live delivery milestones"
              action={
                <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                  {overall}% complete
                </span>
              }
            />
            {loading ? (
              <div className="px-5 py-5">
                <SkeletonRows rows={4} />
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refresh} />
            ) : milestones.length === 0 ? (
              <EmptyState
                icon={<Layers className="h-5 w-5" />}
                title="No milestones published yet"
                description="Your delivery plan will appear here once the VybzTech team publishes it."
              />
            ) : (
              <MilestoneList milestones={milestones} />
            )}
          </Card>
        </div>

        {/* Countdown + commercial detail */}
        <div className="space-y-6">
          <CountdownCard
            targetIso={client?.uat_review_at}
            label="UAT / Staging Review"
          />

          <Card>
            <CardHeader eyebrow="Commercial" title="Engagement summary" />
            <dl className="divide-y divide-hairline">
              {[
                { term: 'Client', detail: client?.legal_name ?? client?.name ?? '—' },
                { term: 'Contract', detail: client?.contract_status ?? '—' },
                { term: 'Invoicing', detail: client?.invoice_status ?? '—' },
                {
                  term: 'Phase value',
                  detail: formatCurrency(
                    client?.contract_value,
                    client?.currency ?? 'NGN',
                  ),
                },
                {
                  term: 'Service provider',
                  detail: 'VybzTech Inc.',
                },
              ].map((row) => (
                <div
                  key={row.term}
                  className="flex items-start justify-between gap-4 px-5 py-3"
                >
                  <dt className="text-xs text-slate-400">{row.term}</dt>
                  <dd className="text-right text-xs font-medium text-slate-300">
                    {row.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  )
}
