import { useMemo } from 'react'
import { FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ResourceCard } from './ResourceCard'
import { useResources } from '@/hooks/usePortalData'
import type { ResourceItem } from '@/types/domain'

const UNCATEGORISED = 'Other documents'

export function DocumentsView() {
  const { data: resources, loading, error, refresh } = useResources()

  const grouped = useMemo(() => {
    const map = new Map<string, ResourceItem[]>()
    for (const resource of resources) {
      const key = resource.category ?? UNCATEGORISED
      const bucket = map.get(key)
      if (bucket) bucket.push(resource)
      else map.set(key, [resource])
    }
    return [...map.entries()]
  }, [resources])

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        description="Executed contracts, requirement documents, invoices and brand assets for this engagement."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <ErrorState message={error} onRetry={refresh} />
        </Card>
      ) : resources.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen className="h-5 w-5" />}
            title="No documents published"
            description="Contracts, invoices and design assets will appear here as they are shared."
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category} aria-labelledby={`vault-${category}`}>
              <div className="mb-3.5 flex items-center gap-3">
                <h2
                  id={`vault-${category}`}
                  className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-2"
                >
                  {category}
                </h2>
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="text-2xs text-ink-3">
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
