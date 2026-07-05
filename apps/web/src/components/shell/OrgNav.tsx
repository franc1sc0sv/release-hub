import { NavLink, generatePath, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Building2, Plug, type LucideIcon } from 'lucide-react'
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
  end: boolean
}

export function OrgNav() {
  const { t } = useTranslation('common')
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId!

  const items: NavItem[] = [
    {
      to: generatePath(ROUTES.ORG_ROOT, { organizationId }),
      labelKey: 'nav.overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: generatePath(ROUTES.ORG_SETTINGS, { organizationId }),
      labelKey: 'nav.organization',
      icon: Building2,
      end: false,
    },
    {
      to: generatePath(ROUTES.ORG_INTEGRATIONS, { organizationId }),
      labelKey: 'nav.integrations',
      icon: Plug,
      end: false,
    },
  ]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('common.platform')}</SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => (
          <SidebarMenuItem key={item.to}>
            <NavLink to={item.to} end={item.end}>
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
