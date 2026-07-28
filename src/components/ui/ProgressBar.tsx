import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number
  /** Complete Tailwind background class, e.g. "bg-solar-500". */
  fill: string
  label?: string
  className?: string
}

export function ProgressBar({ value, fill, label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-white/[0.06]', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', fill)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
