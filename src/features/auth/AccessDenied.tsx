import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'

export function AccessDenied() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="surface w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-solar-500/10 text-solar-400">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="text-base font-semibold text-slate-100">
          No workspace linked to this account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          You signed in successfully, but this address is not yet associated with a
          client engagement. Ask your VybzTech project lead to add you, then sign in
          again.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
