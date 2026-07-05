import { NavLink, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Rocket, LayoutList, Flag, GitBranch, Settings, type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/routes'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
}

export function ProjectNav() {
  const { t } = useTranslation('common')
  const params = useParams<{ organizationId: string; projectId: string }>()
  const organizationId = params.organizationId!
  const projectId = params.projectId!

  const items: NavItem[] = [
    {
      to: generatePath(ROUTES.PROJECT_RELEASES, { organizationId, projectId }),
      labelKey: 'nav.releases',
      icon: Rocket,
    },
    {
      to: generatePath(ROUTES.PROJECT_FEATURES, { organizationId, projectId }),
      labelKey: 'nav.features',
      icon: LayoutList,
    },
    {
      to: generatePath(ROUTES.PROJECT_FLAGS, { organizationId, projectId }),
      labelKey: 'nav.flags',
      icon: Flag,
    },
    {
      to: generatePath(ROUTES.PROJECT_REPO_OPS, { organizationId, projectId }),
      labelKey: 'nav.repoOps',
      icon: GitBranch,
    },
    {
      to: generatePath(ROUTES.PROJECT_SETTINGS, { organizationId, projectId }),
      labelKey: 'nav.settings',
      icon: Settings,
    },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('common.platform')}</SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => (
          <SidebarMenuItem key={item.to}>
            <NavLink to={item.to}>
              {({ isActive }) => (
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={t(item.labelKey)}
                  size="lg"
                  className="text-[14px] py-3"
                >
                  <item.icon className="!size-5" />
                  <span>{t(item.labelKey)}</span>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
