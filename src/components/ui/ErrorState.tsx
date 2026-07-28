import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-10 text-center"
      role="alert"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="max-w-sm text-sm text-slate-400">{message}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
          icon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}
