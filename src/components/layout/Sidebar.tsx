import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NAV_ITEMS } from './navigation'
import { useTenant } from '@/providers/TenantProvider'
import { useAuth } from '@/providers/AuthProvider'
import { initialsOf } from '@/lib/format'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { client, membership } = useTenant()
  const { signOut } = useAuth()

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-line bg-card',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Portal sections"
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              SolarSync
            </p>
            <p className="truncate text-2xs uppercase tracking-[0.12em] text-ink-3">
              by VybzTech
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-lg p-2 text-ink-3 transition hover:bg-raised hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {client ? (
          <div className="mx-3 mb-4 rounded-xl border border-line bg-raised px-3.5 py-3 shadow-inset">
            <p className="eyebrow">Engagement</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{client.name}</p>
            {client.engagement_title ? (
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-2">
                {client.engagement_title}
              </p>
            ) : null}
          </div>
        ) : null}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-start gap-3 rounded-xl px-3 py-2.5 transition',
                  isActive
                    ? 'border border-line bg-raised text-ink shadow-card'
                    : 'border border-transparent text-ink-2 hover:bg-raised/70 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 transition',
                      isActive ? 'text-fg-brand' : 'text-ink-3 group-hover:text-ink-2',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-2xs leading-snug text-ink-3">
                      {item.description}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tint-brand text-2xs font-bold text-fg-brand">
              {initialsOf(membership?.display_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">
                {membership?.display_name ?? 'Client user'}
              </p>
              <p className="truncate text-2xs capitalize text-ink-3">
                {membership?.role ?? 'client'} access
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg p-2 text-ink-3 transition hover:bg-tint-danger hover:text-fg-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
