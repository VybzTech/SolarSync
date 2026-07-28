import { Link2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { EnvironmentCard } from './EnvironmentCard'
import { FigmaEmbed } from './FigmaEmbed'
import { ApiHealthStrip } from './ApiHealthStrip'
import { useStagingEnvironments } from '@/hooks/usePortalData'

export function StagingView() {
  const { data: environments, loading, error, refresh } = useStagingEnvironments()

  const embeds = environments.filter((e) => e.is_embed)
  const links = environments.filter((e) => !e.is_embed)

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Environments" title="Staging & sublinks hub" />
        <Card>
          <div className="px-5 py-5">
            <SkeletonRows rows={4} />
          </div>
        </Card>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Environments" title="Staging & sublinks hub" />
        <Card>
          <ErrorState message={error} onRetry={refresh} />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Environments"
        title="Staging & sublinks hub"
        description="Direct access to every live build, the interactive prototype and the upstream data pipeline powering the FoliVision Inverters Application."
      />

      {environments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Link2 className="h-5 w-5" />}
            title="No environments published"
            description="Staging links will appear here as each environment is provisioned."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {links.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {links.map((environment) => (
                <EnvironmentCard key={environment.id} environment={environment} />
              ))}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              {embeds.length > 0 ? (
                <div className="space-y-6">
                  {embeds.map((environment) => (
                    <FigmaEmbed key={environment.id} environment={environment} />
                  ))}
                </div>
              ) : null}
            </div>
            <div>
              <ApiHealthStrip environments={environments} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
