import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render-time crashes so a client never sees a blank white page.
 * Note this does NOT catch errors thrown inside event handlers or async
 * callbacks — those are handled locally with try/catch and toasts.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SolarSync] Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-full items-center justify-center px-4 py-12">
        <div className="surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-tint-danger text-fg-danger">
            <AlertOctagon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-base font-semibold text-ink">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The portal hit an unexpected error. Reloading usually resolves it. If it
            persists, contact your VybzTech project lead.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload portal
          </Button>
        </div>
      </div>
    )
  }
}
