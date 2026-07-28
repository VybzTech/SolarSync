import { useState } from 'react'
import { ExternalLink, Frame } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { StagingEnvironment } from '@/types/domain'

/**
 * Only render an iframe when the URL is a genuine Figma embed endpoint.
 * The URL comes from the database, so treating it as trusted markup would be
 * an injection vector if a row were ever tampered with.
 */
function isSafeFigmaEmbed(url: string | null): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'www.figma.com' || parsed.hostname === 'figma.com') &&
      !parsed.href.includes('PLACEHOLDER')
    )
  } catch {
    return false
  }
}

export function FigmaEmbed({ environment }: { environment: StagingEnvironment }) {
  const [loaded, setLoaded] = useState(false)
  const embeddable = isSafeFigmaEmbed(environment.embed_url)

  return (
    <Card>
      <CardHeader
        eyebrow="Design"
        title={environment.label}
        description={environment.description ?? undefined}
        action={
          environment.url ? (
            <a
              href={environment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
            >
              Open in Figma
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null
        }
      />

      {embeddable ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-xl bg-canvas-deep">
          {!loaded ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
          <iframe
            title={`${environment.label} interactive prototype`}
            src={environment.embed_url ?? ''}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setLoaded(true)}
          />
        </div>
      ) : (
        <EmptyState
          icon={<Frame className="h-5 w-5" />}
          title="Prototype not yet published"
          description="The interactive Figma prototype will render here once the design board is shared and its embed link is added to the portal."
        />
      )}
    </Card>
  )
}
