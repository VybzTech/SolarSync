import { cn } from '@/lib/cn'

/**
 * Honest connection indicator. Reflects the actual Supabase realtime channel
 * state rather than being decorative — if the subscription drops, this says
 * so instead of continuing to claim the data is live.
 */
export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-2xs font-semibold',
        live ? 'bg-tint-brand text-fg-brand' : 'bg-tint-neutral text-ink-3',
      )}
      title={
        live
          ? 'Connected. Updates appear here the moment they are made.'
          : 'Not connected to live updates. Refresh to see the latest.'
      }
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          live ? 'animate-pulse-dot bg-brand-500' : 'bg-ink-3',
        )}
        aria-hidden="true"
      />
      {live ? 'Live' : 'Offline'}
    </span>
  )
}
