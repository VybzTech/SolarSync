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
  primary:
    'bg-emerald_brand-600 text-white hover:bg-emerald_brand-500 active:bg-emerald_brand-700 disabled:bg-emerald_brand-800',
  secondary:
    'bg-canvas-overlay text-slate-200 ring-1 ring-inset ring-hairline-strong hover:bg-canvas-overlay/70 hover:text-white',
  ghost: 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
}

const SIZES: Record<Size, string> = {
  // 40px / 44px tall — both clear the 40px minimum touch target.
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
        'inline-flex items-center justify-center rounded-lg font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
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
