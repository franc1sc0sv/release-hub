import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrgSectionNavItem {
  slug: string
  labelKey: string
  icon: LucideIcon
}

interface OrgSectionNavProps {
  items: readonly OrgSectionNavItem[]
  buildPath: (slug: string) => string
  ariaLabelKey: string
}

export function OrgSectionNav({ items, buildPath, ariaLabelKey }: OrgSectionNavProps) {
  const { t } = useTranslation('organization')

  return (
    <nav
      aria-label={t(ariaLabelKey)}
      className="glass flex gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-border/60 p-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible"
    >
      {items.map(({ slug, labelKey, icon: Icon }) => (
        <NavLink
          key={slug}
          to={buildPath(slug)}
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
