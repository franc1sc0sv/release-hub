import { useEffect } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Settings } from 'lucide-react'
import { useProject } from '@/context/project.context'
import { PageShell } from '@/components/nebula/PageShell'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SettingsNav } from '../components/settings-nav'

export default function SettingsLayout() {
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
      {!activeProject ? (
        <EmptyState
          icon={<Settings className="size-6 text-brand-indigo-bright" />}
          heading={t('empty.heading')}
          description={t('empty.description')}
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:w-60 lg:shrink-0">
            <SettingsNav />
          </div>
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      )}
    </PageShell>
  )
}
