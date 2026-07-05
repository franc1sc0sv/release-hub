import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'
import { ShellFrame } from './ShellFrame'
import { OrgNav } from './OrgNav'
import { OrganizationSwitcher } from '@/features/organization/components/OrganizationSwitcher'
import { SidebarMenuItem } from '@/components/ui/sidebar'

const ORG_ROUTE_KEYS: Record<string, string> = {
  '': 'nav.overview',
  settings: 'nav.organization',
  integrations: 'nav.integrations',
}

export function OrgShell() {
  const { t } = useTranslation('common')
  const { organizationId } = useParams<{ organizationId: string }>()
  const location = useLocation()
  const { organizations, setActiveOrgId, loading } = useOrganization()

  useEffect(() => {
    if (organizationId) setActiveOrgId(organizationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  if (
    !loading &&
    organizationId &&
    organizations.length > 0 &&
    !organizations.some((o) => o.id === organizationId)
  ) {
    return <Navigate to={ROUTES.ROOT} replace />
  }

  const segments = location.pathname.split('/').filter(Boolean)
  const section = segments[1] ?? ''
  const fallbackTitle = t(ORG_ROUTE_KEYS[section] ?? 'nav.overview')

  return (
    <ShellFrame
      sidebarHeader={
        <SidebarMenuItem>
          <OrganizationSwitcher />
        </SidebarMenuItem>
      }
      nav={<OrgNav />}
      fallbackTitle={fallbackTitle}
    />
  )
}
