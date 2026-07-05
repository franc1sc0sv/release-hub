import { NavLink, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { SETTINGS_SECTIONS } from '../config/settings-sections'

export function SettingsNav() {
  const { t } = useTranslation('settings')
  const params = useParams<{ organizationId: string; projectId: string }>()
  const organizationId = params.organizationId!
  const projectId = params.projectId!

  return (
    <nav
      aria-label={t('title')}
      className="glass flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-border/60 p-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible"
    >
      {SETTINGS_SECTIONS.map(({ slug, labelKey, icon: Icon }) => (
        <NavLink
          key={slug}
          to={generatePath(ROUTES.PROJECT_SETTINGS_SECTION, {
            organizationId,
            projectId,
            section: slug,
          })}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 whitespace-nowrap rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-indigo/20 text-foreground'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn('size-4 shrink-0', isActive && 'text-brand-indigo-bright')}
                aria-hidden
              />
              <span>{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
