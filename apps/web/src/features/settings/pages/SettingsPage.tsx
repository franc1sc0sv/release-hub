import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useProject } from '@/context/project.context'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { MembersSection } from '@/features/collaboration/components/members-section'
import { ConnectionsSection } from '../components/connections-section'
import { TagsSection } from '../components/tags-section'

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const { activeProject } = useProject()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const linearParam = searchParams.get('linear')
    if (!linearParam) return

    if (linearParam === 'connected') {
      toast.success(t('connections.linear.oauth.success'))
    } else {
      toast.error(t('connections.linear.oauth.error'))
    }

    setSearchParams(
      (prev: URLSearchParams) => {
        prev.delete('linear')
        return prev
      },
      { replace: true },
    )
  }, [])

  return (
    <NebulaBackground className="p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-overline uppercase tracking-widest text-muted-foreground">
            {t('subtitle')}
          </p>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
        </div>

        {activeProject && (
          <>
            <section aria-labelledby="connections-heading">
              <h2
                id="connections-heading"
                className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t('sections.connections')}
              </h2>
              <ConnectionsSection projectId={activeProject.id} />
            </section>

            <section aria-labelledby="tags-heading">
              <h2
                id="tags-heading"
                className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t('sections.tags')}
              </h2>
              <TagsSection projectId={activeProject.id} />
            </section>

            <section aria-labelledby="members-heading">
              <h2
                id="members-heading"
                className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t('sections.members')}
              </h2>
              <MembersSection projectId={activeProject.id} />
            </section>
          </>
        )}
      </div>
    </NebulaBackground>
  )
}
