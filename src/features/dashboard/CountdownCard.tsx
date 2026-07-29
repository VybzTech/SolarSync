import { CalendarClock, PartyPopper } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import { formatDateTime } from '@/lib/format'

interface CountdownCardProps {
  targetIso: string | null | undefined
  label: string
}

function Segment({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex-1 rounded-xl border border-line bg-raised px-2 py-3 text-center shadow-inset">
      <p className="font-mono text-2xl font-bold tabular-nums leading-none text-ink sm:text-[1.75rem]">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1.5 text-2xs uppercase tracking-[0.1em] text-ink-3">{unit}</p>
    </div>
  )
}

export function CountdownCard({ targetIso, label }: CountdownCardProps) {
  const countdown = useCountdown(targetIso)

  return (
    <div className="surface sheen px-5 py-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint-warn text-fg-warn shadow-inset">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Next major checkpoint</p>
          <p className="truncate text-sm font-semibold text-ink">{label}</p>
        </div>
      </div>

      {countdown.unset ? (
        <p className="py-4 text-sm text-ink-2">
          A review date has not been scheduled yet.
        </p>
      ) : countdown.elapsed ? (
        <div className="flex items-center gap-3 rounded-xl bg-tint-brand px-4 py-4">
          <PartyPopper className="h-5 w-5 shrink-0 text-fg-brand" aria-hidden="true" />
          <p className="text-sm text-fg-brand">
            The scheduled review window has arrived.
          </p>
        </div>
      ) : (
        <div
          className="flex gap-2"
          role="timer"
          aria-live="off"
          aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes remaining`}
        >
          <Segment value={countdown.days} unit="Days" />
          <Segment value={countdown.hours} unit="Hrs" />
          <Segment value={countdown.minutes} unit="Min" />
          <Segment value={countdown.seconds} unit="Sec" />
        </div>
      )}

      {targetIso ? (
        <p className="mt-3.5 text-xs text-ink-3">
          Scheduled for {formatDateTime(targetIso)} WAT
        </p>
      ) : null}
    </div>
  )
}
