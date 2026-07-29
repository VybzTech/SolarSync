import { useState, type FormEvent } from 'react'
import { KeyRound, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ParticleField } from '@/components/visual/ParticleField'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'

type Mode = 'pin' | 'magic'

export function LoginScreen() {
  const { signInWithPin, sendMagicLink } = useAuth()
  const [mode, setMode] = useState<Mode>('pin')

  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkSent, setLinkSent] = useState(false)

  async function handlePinSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!code.trim() || !pin.trim()) {
      setError('Enter both your Client ID and PIN.')
      return
    }
    setSubmitting(true)
    try {
      await signInWithPin(code, pin)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Sign-in failed.')
      setPin('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMagicSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      await sendMagicLink(email)
      setLinkSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send link.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setLinkSent(false)
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-page px-4 py-10">
      <ParticleField density={58} intensity={0.9} />

      {/* Radial fade keeps the card legible over the constellation. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 50% 45%, rgb(var(--page)) 20%, rgb(var(--page) / 0.4) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">SolarSync</h1>
          <p className="mt-1.5 text-sm text-ink-2">Client delivery portal by VybzTech</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
          <div
            className="grid grid-cols-2 border-b border-line bg-raised"
            role="tablist"
            aria-label="Sign-in method"
          >
            {([
              { id: 'pin' as const, label: 'Client PIN', icon: KeyRound },
              { id: 'magic' as const, label: 'Email link', icon: Mail },
            ]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => switchMode(tab.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm',
                  mode === tab.id
                    ? 'bg-card text-ink shadow-card'
                    : 'text-ink-3 hover:bg-card/50 hover:text-ink-2',
                )}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {mode === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4" noValidate>
                <TextField
                  label="Client ID"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="FOLIVISION"
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={32}
                  required
                />
                <TextField
                  label="Access PIN"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  autoComplete="current-password"
                  maxLength={64}
                  required
                />
                {error ? (
                  <p
                    className="rounded-lg bg-tint-danger px-3 py-2.5 text-sm text-fg-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <Button type="submit" loading={submitting} className="w-full">
                  {submitting ? 'Verifying' : 'Enter portal'}
                </Button>
              </form>
            ) : linkSent ? (
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-tint-brand text-fg-brand">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-ink">Check your inbox</p>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-2">
                  We sent a secure sign-in link to{' '}
                  <span className="font-medium text-ink">{email}</span>. It expires in one hour.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-5"
                  onClick={() => setLinkSent(false)}
                  icon={<ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Use a different address
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicSubmit} className="space-y-4" noValidate>
                <TextField
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  spellCheck={false}
                  required
                />
                {error ? (
                  <p
                    className="rounded-lg bg-tint-danger px-3 py-2.5 text-sm text-fg-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <Button type="submit" loading={submitting} className="w-full">
                  {submitting ? 'Sending' : 'Email me a sign-in link'}
                </Button>
                <p className="text-center text-xs text-ink-3">
                  No password required. The link signs you in on this device.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-2xs text-ink-3">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Confidential. Access is logged and restricted to authorised stakeholders.
        </p>
      </div>
    </div>
  )
}
