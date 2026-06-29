import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Rocket, LayoutList, Flag, Settings, type LucideIcon } from 'lucide-react'
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

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.WORKSPACE, labelKey: 'nav.workspace', icon: FolderOpen },
  { to: ROUTES.RELEASES, labelKey: 'nav.releases', icon: Rocket },
  { to: ROUTES.FEATURES, labelKey: 'nav.features', icon: LayoutList },
  { to: ROUTES.FLAGS, labelKey: 'nav.flags', icon: Flag },
  { to: ROUTES.SETTINGS, labelKey: 'nav.settings', icon: Settings },
]

export function MainNav() {
  const { t } = useTranslation('common')

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('common.platform')}</SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {NAV_ITEMS.map((item) => (
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
