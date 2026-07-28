import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { REQUEST_TONES, SEVERITY_TONES, KIND_LABELS } from '@/lib/tokens'
import { formatDate, formatRelative } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ChangeRequest } from '@/types/domain'

function RequestRow({ request }: { request: ChangeRequest }) {
  const [expanded, setExpanded] = useState(false)
  const statusTone = REQUEST_TONES[request.status]
  const severityTone = SEVERITY_TONES[request.severity]
  const detailId = `request-detail-${request.id}`

  return (
    <>
      <tr
        className={cn(
          'cursor-pointer align-top transition hover:bg-white/[0.02]',
          expanded && 'bg-white/[0.02]',
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-5 py-3.5">
          <button
            type="button"
            className="flex items-start gap-2 text-left"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
          >
            <ChevronDown
              className={cn(
                'mt-0.5 h-3.5 w-3.5 shrink-0 text-muted transition-transform',
                expanded && 'rotate-180',
              )}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block font-mono text-2xs text-muted">
                {request.reference}
              </span>
              <span className="mt-0.5 block text-sm font-medium text-slate-200">
                {request.title}
              </span>
              <span className="mt-0.5 block text-2xs text-muted">
                {KIND_LABELS[request.kind]}
                {request.submitted_by_name ? ` · ${request.submitted_by_name}` : ''}
              </span>
            </span>
          </button>
        </td>
        <td className="px-5 py-3.5">
          <Badge tone={severityTone.chip} dot={severityTone.fill}>
            {request.severity}
          </Badge>
        </td>
        <td className="px-5 py-3.5">
          <Badge tone={statusTone.chip} dot={statusTone.fill}>
            {request.status}
          </Badge>
        </td>
        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-400">
          <span title={formatDate(request.submitted_date)}>
            {formatRelative(request.submitted_date)}
          </span>
        </td>
      </tr>

      {expanded ? (
        <tr id={detailId} className="bg-canvas-deep/60">
          <td colSpan={4} className="px-5 pb-5 pt-1">
            <div className="ml-5 space-y-3 border-l-2 border-hairline-strong pl-4">
              <div>
                <p className="eyebrow mb-1">Description</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">
                  {request.description}
                </p>
              </div>

              {request.resolution_notes ? (
                <div>
                  <p className="eyebrow mb-1">VybzTech response</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-400">
                    {request.resolution_notes}
                  </p>
                </div>
              ) : null}

              <dl className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1 text-2xs text-muted">
                <div className="flex gap-1.5">
                  <dt>Submitted</dt>
                  <dd className="text-slate-400">{formatDate(request.submitted_date)}</dd>
                </div>
                {request.acknowledged_at ? (
                  <div className="flex gap-1.5">
                    <dt>Acknowledged</dt>
                    <dd className="text-slate-400">
                      {formatRelative(request.acknowledged_at)}
                    </dd>
                  </div>
                ) : null}
                {request.resolved_at ? (
                  <div className="flex gap-1.5">
                    <dt>Resolved</dt>
                    <dd className="text-emerald_brand-400">
                      {formatDate(request.resolved_at)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}

export function RequestTable({ requests }: { requests: ChangeRequest[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] text-left">
        <thead>
          <tr className="border-b border-hairline text-2xs uppercase tracking-[0.1em] text-slate-400">
            <th scope="col" className="px-5 py-3 font-semibold">Request</th>
            <th scope="col" className="px-5 py-3 font-semibold">Severity</th>
            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
            <th scope="col" className="px-5 py-3 font-semibold">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
