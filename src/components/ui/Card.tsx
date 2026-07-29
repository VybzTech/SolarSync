import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  /** Adds hover elevation. Use only when the whole card is interactive. */
  interactive?: boolean
  /** Adds the lit top edge. Skip on cards that sit inside another card. */
  sheen?: boolean
}

export function Card({
  children,
  className,
  interactive = false,
  sheen = true,
}: CardProps) {
  return (
    <div
      className={cn(
        'surface overflow-hidden',
        sheen && 'sheen',
        interactive &&
          'transition duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function CardHeader({
  title,
  eyebrow,
  description,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-line bg-raised/60 px-5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
