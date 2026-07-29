import type { ReactNode } from 'react'
import { ParticleField } from '@/components/visual/ParticleField'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-card shadow-card lg:mb-8">
      {/* Subtle animated field, clipped to the header only. */}
      <ParticleField density={26} intensity={0.55} />

      {/* Fade so the constellation never competes with the heading. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/40"
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-end justify-between gap-4 px-5 py-6 sm:px-6">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
