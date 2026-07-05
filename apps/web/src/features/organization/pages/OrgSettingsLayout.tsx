import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { useOrganization } from '@/context/organization.context'
import { PageShell } from '@/components/nebula/PageShell'
import { EmptyState } from '@/components/nebula/EmptyState'
import { OrgSettingsNav } from '../components/OrgSettingsNav'

export default function OrgSettingsLayout() {
  const { t } = useTranslation('organization')
  const { activeOrg } = useOrganization()

  return (
    <PageShell eyebrow={t('subtitle')} title={activeOrg?.name ?? t('title')}>
      {!activeOrg ? (
        <EmptyState
          icon={<Building2 className="size-6 text-brand-indigo-bright" />}
          heading={t('empty.heading')}
          description={t('empty.description')}
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:w-60 lg:shrink-0">
            <OrgSettingsNav />
          </div>
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      )}
    </PageShell>
  )
}
