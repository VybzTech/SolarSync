import { cn } from '@/lib/cn'

/**
 * Honest connection indicator. Reflects the actual Supabase realtime channel
 * state rather than being decorative — if the subscription drops, this says
 * so instead of claiming the data is live.
 */
export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-2xs font-semibold',
        live
          ? 'bg-emerald_brand-500/12 text-emerald_brand-300'
          : 'bg-white/[0.04] text-muted',
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
          live ? 'animate-pulse-dot bg-emerald_brand-400' : 'bg-slate-600',
        )}
        aria-hidden="true"
      />
      {live ? 'Live' : 'Offline'}
    </span>
  )
}
