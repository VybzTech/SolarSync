import { Logo } from '@/components/layout/Logo'

export function FullPageLoader({ label = 'Loading portal' }: { label?: string }) {
  return (
    <div
      className="flex min-h-full flex-col items-center justify-center gap-4 bg-page"
      role="status"
      aria-live="polite"
    >
      <Logo className="h-11 w-11 animate-pulse-dot" />
      <p className="text-sm text-ink-2">{label}</p>
    </div>
  )
}
