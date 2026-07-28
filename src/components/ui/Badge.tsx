import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps {
  children: ReactNode
  /** Complete Tailwind class string from src/lib/tokens.ts. */
  tone: string
  className?: string
  /** Renders a leading status dot. */
  dot?: string
}

export function Badge({ children, tone, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-2xs font-semibold',
        tone,
        className,
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}
