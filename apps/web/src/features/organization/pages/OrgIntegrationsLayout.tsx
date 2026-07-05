import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plug } from 'lucide-react'
import { useOrganization } from '@/context/organization.context'
import { PageShell } from '@/components/nebula/PageShell'
import { EmptyState } from '@/components/nebula/EmptyState'
import { OrgIntegrationsNav } from '../components/OrgIntegrationsNav'

export default function OrgIntegrationsLayout() {
  const { t } = useTranslation('organization')
  const { activeOrg } = useOrganization()

  return (
    <PageShell eyebrow={t('integrationsNav.title')} title={activeOrg?.name ?? t('integrationsNav.title')}>
      {!activeOrg ? (
        <EmptyState
          icon={<Plug className="size-6 text-brand-indigo-bright" />}
          heading={t('empty.heading')}
          description={t('empty.description')}
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:w-60 lg:shrink-0">
            <OrgIntegrationsNav />
          </div>
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      )}
    </PageShell>
  )
}
