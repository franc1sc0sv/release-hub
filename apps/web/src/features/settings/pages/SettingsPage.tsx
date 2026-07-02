import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'
import { useProject } from '@/context/project.context'
import { PageShell } from '@/components/nebula/PageShell'
import { EmptyState } from '@/components/nebula/EmptyState'
import { MembersSection } from '@/features/collaboration/components/members-section'
import { ConnectionsSection } from '../components/connections-section'
import { TagsSection } from '../components/tags-section'
import { FlagTrackingSection } from '../components/flag-tracking-section'
import { NotificationPreferencesSection } from '../components/notification-preferences-section'

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
    <PageShell eyebrow={t('subtitle')} title={t('title')}>
      <div className="space-y-8">
        {!activeProject && (
          <EmptyState
            icon={<Settings className="size-6 text-brand-indigo-bright" />}
            heading={t('empty.heading')}
            description={t('empty.description')}
          />
        )}

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

            <section aria-labelledby="notifications-heading">
              <h2
                id="notifications-heading"
                className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t('sections.notifications')}
              </h2>
              <NotificationPreferencesSection projectId={activeProject.id} />
            </section>

            <section aria-labelledby="flag-tracking-heading">
              <h2
                id="flag-tracking-heading"
                className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {t('sections.flagTracking')}
              </h2>
              <FlagTrackingSection projectId={activeProject.id} />
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
    </PageShell>
  )
}
