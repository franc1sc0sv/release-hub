import { generatePath, useParams } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { OrgSectionNav } from './OrgSectionNav'
import { ORG_INTEGRATION_SECTIONS } from '../config/organization-integrations'

export function OrgIntegrationsNav() {
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId!

  return (
    <OrgSectionNav
      items={ORG_INTEGRATION_SECTIONS}
      buildPath={(slug) =>
        generatePath(ROUTES.ORG_INTEGRATION, { organizationId, integration: slug })
      }
      ariaLabelKey="integrationsNav.title"
    />
  )
}
