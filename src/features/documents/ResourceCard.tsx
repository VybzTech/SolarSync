import {
  ArrowUpRight,
  FileArchive,
  FileText,
  Frame,
  ImageIcon,
  Link2,
  Lock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { RESOURCE_ACCENTS } from '@/lib/tokens'
import { cn } from '@/lib/cn'
import type { ResourceItem, ResourceKind } from '@/types/domain'

const ICONS: Record<ResourceKind, LucideIcon> = {
  PDF: FileText,
  Doc: FileText,
  Figma: Frame,
  Link: Link2,
  Image: ImageIcon,
  Archive: FileArchive,
}

/** External links need noopener; same-origin asset paths do not. */
function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const Icon = ICONS[resource.type]
  const external = isExternal(resource.url)

  return (
    <a
      href={resource.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={!external ? '' : undefined}
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-solar-500"
      aria-label={`Open ${resource.document_name}`}
    >
      <Card interactive className="h-full">
        <div className="flex h-full flex-col p-5">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset',
                RESOURCE_ACCENTS[resource.type],
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-ink-3 transition group-hover:text-fg-warn"
              aria-hidden="true"
            />
          </div>

          <h3 className="text-sm font-semibold leading-snug text-ink">
            {resource.document_name}
          </h3>

          {resource.description ? (
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-2">
              {resource.description}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-line pt-3 text-2xs text-ink-3">
            <span className="font-semibold uppercase tracking-wider">
              {resource.type}
            </span>
            {resource.version ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{resource.version}</span>
              </>
            ) : null}
            {resource.file_size ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{resource.file_size}</span>
              </>
            ) : null}
            {resource.is_confidential ? (
              <span className="ml-auto inline-flex items-center gap-1 text-ink-3">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Confidential
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </a>
  )
}
