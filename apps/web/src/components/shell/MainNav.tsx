import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, type LucideIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
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
