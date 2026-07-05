import { Navigate, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'
import { ORG_SETTINGS_SECTIONS, DEFAULT_ORG_SETTINGS_SLUG } from '../config/organization-settings-sections'

export default function OrgSettingsSectionPage() {
  const { t } = useTranslation('organization')
  const params = useParams<{ organizationId: string; section: string }>()
  const organizationId = params.organizationId!
  const { activeOrg } = useOrganization()

  const section = ORG_SETTINGS_SECTIONS.find((item) => item.slug === params.section)
  if (!section) {
    return (
      <Navigate
        to={generatePath(ROUTES.ORG_SETTINGS_SECTION, {
          organizationId,
          section: DEFAULT_ORG_SETTINGS_SLUG,
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
