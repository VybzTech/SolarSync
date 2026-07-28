import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatWidgetProps {
  icon: ReactNode
  label: string
  value: string
  detail?: string
  accent?: 'emerald' | 'solar' | 'vybz' | 'neutral'
}

const ACCENTS: Record<NonNullable<StatWidgetProps['accent']>, string> = {
  emerald: 'bg-emerald_brand-500/12 text-emerald_brand-300',
  solar: 'bg-solar-500/12 text-solar-400',
  vybz: 'bg-vybz-500/12 text-vybz-400',
  neutral: 'bg-white/[0.05] text-slate-400',
}

export function StatWidget({
  icon,
  label,
  value,
  detail,
  accent = 'neutral',
}: StatWidgetProps) {
  return (
    <div className="surface px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            ACCENTS[accent],
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{label}</p>
          <p className="mt-1 truncate text-base font-semibold text-slate-100">{value}</p>
          {detail ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
