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
      {/* Mobile scrim */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col border-r border-hairline bg-canvas',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Portal sections"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              SolarSync
            </p>
            <p className="truncate text-2xs uppercase tracking-[0.12em] text-slate-400">
              by VybzTech
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-slate-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Engagement */}
        {client ? (
          <div className="mx-3 mb-4 rounded-lg border border-hairline bg-canvas-raised px-3.5 py-3">
            <p className="eyebrow">Engagement</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-100">
              {client.name}
            </p>
            {client.engagement_title ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                {client.engagement_title}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-start gap-3 rounded-lg px-3 py-2.5 transition',
                  isActive
                    ? 'bg-emerald_brand-600/15 text-white ring-1 ring-inset ring-emerald_brand-500/30'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 transition',
                      isActive
                        ? 'text-solar-400'
                        : 'text-slate-400 group-hover:text-slate-300',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Account */}
        <div className="border-t border-hairline p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-overlay text-2xs font-bold text-slate-300">
              {initialsOf(membership?.display_name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-300">
                {membership?.display_name ?? 'Client user'}
              </p>
              <p className="truncate text-2xs capitalize text-muted">
                {membership?.role ?? 'client'} access
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
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
