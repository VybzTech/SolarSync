import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

export function AccessDenied() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-full items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 text-center shadow-pop">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-tint-warn text-fg-warn">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="text-base font-semibold text-ink">
          No workspace linked to this account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          You signed in successfully, but this address is not yet associated with a client
          engagement. Ask your VybzTech project lead to add you, then sign in again.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
