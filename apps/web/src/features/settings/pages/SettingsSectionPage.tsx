import { Navigate, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { SETTINGS_SECTIONS, DEFAULT_SETTINGS_SLUG } from '../config/settings-sections'

export default function SettingsSectionPage() {
  const { t } = useTranslation('settings')
  const params = useParams<{ organizationId: string; projectId: string; section: string }>()
  const organizationId = params.organizationId!
  const projectId = params.projectId!
  const { activeProject } = useProject()

  const section = SETTINGS_SECTIONS.find((item) => item.slug === params.section)
  if (!section) {
    return (
      <Navigate
        to={generatePath(ROUTES.PROJECT_SETTINGS_SECTION, {
          organizationId,
          projectId,
          section: DEFAULT_SETTINGS_SLUG,
        })}
        replace
      />
    )
  }

  if (!activeProject) return null

  return (
    <div className="space-y-6 [&_[data-slot=card]]:py-6 [&_[data-slot=card-header]]:px-6 [&_[data-slot=card-content]]:px-6 [&_[data-slot=card-footer]]:px-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {t(section.labelKey)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t(section.descriptionKey)}</p>
      </div>
      {section.render(activeProject.id)}
    </div>
  )
}
