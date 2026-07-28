import { CalendarClock, PartyPopper } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import { formatDateTime } from '@/lib/format'

interface CountdownCardProps {
  targetIso: string | null | undefined
  label: string
}

function Segment({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex-1 rounded-lg bg-black/25 px-2 py-3 text-center ring-1 ring-inset ring-white/[0.06]">
      <p className="font-mono text-2xl font-bold tabular-nums leading-none text-white sm:text-3xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1.5 text-2xs uppercase tracking-[0.12em] text-slate-400">{unit}</p>
    </div>
  )
}

export function CountdownCard({ targetIso, label }: CountdownCardProps) {
  const countdown = useCountdown(targetIso)

  return (
    <div className="surface relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(28rem 16rem at 88% -20%, rgba(251,176,64,0.16), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="relative px-5 py-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-solar-500/15 text-solar-400">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Next major checkpoint</p>
            <p className="truncate text-sm font-semibold text-slate-100">{label}</p>
          </div>
        </div>

        {countdown.unset ? (
          <p className="py-4 text-sm text-slate-400">
            A review date has not been scheduled yet.
          </p>
        ) : countdown.elapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald_brand-500/10 px-4 py-4 ring-1 ring-inset ring-emerald_brand-500/25">
            <PartyPopper className="h-5 w-5 shrink-0 text-emerald_brand-300" aria-hidden="true" />
            <p className="text-sm text-emerald_brand-200">
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
          <p className="mt-3.5 text-xs text-slate-400">
            Scheduled for {formatDateTime(targetIso)} WAT
          </p>
        ) : null}
      </div>
    </div>
  )
}
