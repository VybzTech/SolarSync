import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  // Tactile depth: a lit inner top edge plus a soft drop shadow, pressed
  // flat on :active.
  primary:
    'bg-brand-600 text-white shadow-card ring-1 ring-inset ring-white/15 ' +
    'hover:bg-brand-500 hover:shadow-lift active:translate-y-px active:shadow-none ' +
    'disabled:bg-brand-800',
  secondary:
    'bg-card text-ink border border-line shadow-card ' +
    'hover:bg-raised hover:border-line-2 hover:shadow-lift ' +
    'active:translate-y-px active:shadow-none',
  ghost: 'text-ink-2 hover:bg-raised hover:text-ink',
  danger:
    'bg-fg-danger text-white shadow-card ring-1 ring-inset ring-white/15 ' +
    'hover:brightness-110 hover:shadow-lift active:translate-y-px active:shadow-none',
}

const SIZES: Record<Size, string> = {
  // 40px / 44px tall - both clear the 40px minimum touch target.
  sm: 'h-10 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
