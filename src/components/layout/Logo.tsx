import { cn } from '@/lib/cn'

/** SolarSync mark — a stylised sun on the FoliVision emerald. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-card ring-1 ring-inset ring-white/20',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <circle cx="12" cy="12" r="4" fill="#FBB040" />
        <g stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.92">
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2" />
          <path d="M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
        </g>
      </svg>
    </span>
  )
}
