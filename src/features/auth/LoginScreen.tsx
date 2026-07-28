import { useState, type FormEvent } from 'react'
import { KeyRound, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
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
      // On success the auth listener swaps this screen out.
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
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient brand wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(60rem 40rem at 15% -10%, rgba(0,104,55,0.20), transparent 60%),' +
            'radial-gradient(50rem 35rem at 95% 105%, rgba(251,176,64,0.14), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            SolarSync
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Client delivery portal by VybzTech
          </p>
        </div>

        <div className="surface overflow-hidden">
          {/* Mode switch */}
          <div
            className="grid grid-cols-2 border-b border-hairline"
            role="tablist"
            aria-label="Sign-in method"
          >
            {(
              [
                { id: 'pin' as const, label: 'Client PIN', icon: KeyRound },
                { id: 'magic' as const, label: 'Email link', icon: Mail },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => switchMode(tab.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs font-medium transition sm:gap-2 sm:px-4 sm:text-sm',
                  mode === tab.id
                    ? 'bg-white/[0.04] text-white'
                    : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-300',
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
                  <p className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" loading={submitting} className="w-full">
                  {submitting ? 'Verifying' : 'Enter portal'}
                </Button>
              </form>
            ) : linkSent ? (
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald_brand-500/15 text-emerald_brand-300">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Check your inbox</p>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-400">
                  We sent a secure sign-in link to{' '}
                  <span className="text-slate-300">{email}</span>. It expires in one hour.
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
                  <p className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" loading={submitting} className="w-full">
                  {submitting ? 'Sending' : 'Email me a sign-in link'}
                </Button>
                <p className="text-center text-xs text-muted">
                  No password required. The link signs you in on this device.
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-2xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Confidential. Access is logged and restricted to authorised stakeholders.
        </p>
      </div>
    </div>
  )
}
