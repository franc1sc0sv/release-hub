import { generatePath, useParams } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { OrgSectionNav } from './OrgSectionNav'
import { ORG_SETTINGS_SECTIONS } from '../config/organization-settings-sections'

export function OrgSettingsNav() {
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId!

  return (
    <OrgSectionNav
      items={ORG_SETTINGS_SECTIONS}
      buildPath={(slug) => generatePath(ROUTES.ORG_SETTINGS_SECTION, { organizationId, section: slug })}
      ariaLabelKey="title"
    />
  )
}
