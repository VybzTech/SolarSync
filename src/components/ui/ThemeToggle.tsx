import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { cn } from '@/lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full',
        'border border-line bg-raised shadow-inset transition-colors',
        'hover:border-line-2',
        className,
      )}
    >
      {/* Sliding knob */}
      <span
        className={cn(
          'absolute left-1 flex h-7 w-7 items-center justify-center rounded-full',
          'bg-card shadow-card ring-1 ring-line transition-transform duration-300',
          isDark && 'translate-x-[2.125rem]',
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-fg-info" aria-hidden="true" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-fg-warn" aria-hidden="true" />
        )}
      </span>

      {/* Static track icons */}
      <Sun
        className={cn(
          'absolute left-[0.6rem] h-3.5 w-3.5 transition-opacity',
          isDark ? 'opacity-40 text-ink-3' : 'opacity-0',
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute right-[0.6rem] h-3.5 w-3.5 transition-opacity',
          isDark ? 'opacity-0' : 'opacity-40 text-ink-3',
        )}
        aria-hidden="true"
      />
    </button>
  )
}
