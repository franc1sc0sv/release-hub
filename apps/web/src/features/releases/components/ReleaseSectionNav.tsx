import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReleaseSection } from '../constants/release-sections'

export interface IReleaseSectionNavItem {
  section: ReleaseSection
  label: string
  badge: ReactNode
}

interface ReleaseSectionNavProps {
  items: IReleaseSectionNavItem[]
  active: ReleaseSection
  onSelect: (section: ReleaseSection) => void
}

export function ReleaseSectionNav({ items, active, onSelect }: ReleaseSectionNavProps) {
  const { t } = useTranslation('releases')

  return (
    <nav
      aria-label={t('workspace.navLabel')}
      className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {items.map((item) => {
        const isActive = item.section === active
        return (
          <Button
            key={item.section}
            variant="ghost"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(item.section)}
            className={cn(
              'h-10 shrink-0 justify-between gap-3 px-3 text-sm font-normal text-foreground/75 hover:text-foreground lg:w-full',
              isActive &&
                'bg-brand-indigo-bright/15 text-foreground shadow-[inset_2px_0_0_var(--brand-magenta)] hover:bg-brand-indigo-bright/20',
            )}
          >
            <span>{item.label}</span>
            {item.badge}
          </Button>
        )
      })}
    </nav>
  )
}
