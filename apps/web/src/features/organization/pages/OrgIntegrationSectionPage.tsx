import { Navigate, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'
import {
  ORG_INTEGRATION_SECTIONS,
  DEFAULT_ORG_INTEGRATION_SLUG,
} from '../config/organization-integrations'

export default function OrgIntegrationSectionPage() {
  const { t } = useTranslation('organization')
  const params = useParams<{ organizationId: string; integration: string }>()
  const organizationId = params.organizationId!
  const { activeOrg } = useOrganization()

  const section = ORG_INTEGRATION_SECTIONS.find((item) => item.slug === params.integration)
  if (!section) {
    return (
      <Navigate
        to={generatePath(ROUTES.ORG_INTEGRATION, {
          organizationId,
          integration: DEFAULT_ORG_INTEGRATION_SLUG,
        })}
        replace
      />
    )
  }

  if (!activeOrg) return null

  return (
    <div className="space-y-6 [&_[data-slot=card]]:py-6 [&_[data-slot=card-header]]:px-6 [&_[data-slot=card-content]]:px-6 [&_[data-slot=card-footer]]:px-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {t(section.labelKey)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t(section.descriptionKey)}</p>
      </div>
      {section.render()}
    </div>
  )
}
