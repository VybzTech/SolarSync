import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatWidgetProps {
  icon: ReactNode
  label: string
  value: string
  detail?: string
  accent?: 'brand' | 'warn' | 'info' | 'neutral'
}

const ACCENTS: Record<NonNullable<StatWidgetProps['accent']>, string> = {
  brand: 'bg-tint-brand text-fg-brand',
  warn: 'bg-tint-warn text-fg-warn',
  info: 'bg-tint-info text-fg-info',
  neutral: 'bg-tint-neutral text-ink-3',
}

export function StatWidget({
  icon,
  label,
  value,
  detail,
  accent = 'neutral',
}: StatWidgetProps) {
  return (
    <div className="surface sheen px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-inset',
            ACCENTS[accent],
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{label}</p>
          <p className="mt-1 truncate text-lg font-semibold tracking-tight text-ink">
            {value}
          </p>
          {detail ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-2">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
