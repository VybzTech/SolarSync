import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SEVERITY_TONES } from '@/lib/tokens'
import type { SlaResponseTier } from '@/types/domain'

export function SlaTierTable({ tiers }: { tiers: SlaResponseTier[] }) {
  if (tiers.length === 0) return null

  return (
    <Card>
      <CardHeader
        eyebrow="Contractual"
        title="Incident response targets"
        description="Response and resolution commitments by severity, per the executed SLA."
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-2xs uppercase tracking-[0.1em] text-ink-2">
              <th scope="col" className="px-5 py-3 font-semibold">Severity</th>
              <th scope="col" className="px-5 py-3 font-semibold">Response</th>
              <th scope="col" className="px-5 py-3 font-semibold">Resolution</th>
              <th scope="col" className="px-5 py-3 font-semibold">Support hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tiers.map((tier) => {
              const tone = SEVERITY_TONES[tier.severity]
              return (
                <tr key={tier.id} className="align-top">
                  <td className="px-5 py-3.5">
                    <Badge tone={tone.chip} dot={tone.fill}>
                      {tier.severity}
                    </Badge>
                    <p className="mt-1.5 max-w-[16rem] text-xs leading-snug text-ink-3">
                      {tier.trigger_summary}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink-2">
                    {tier.response_time}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink-2">
                    {tier.resolution_target}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-2">
                    {tier.support_hours}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
