import { Outlet, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { BreadcrumbProvider, useBreadcrumb } from '@/context/breadcrumb.context'
import { ProjectSwitcher } from '@/features/workspace/components/ProjectSwitcher'

const ROUTE_KEYS: Record<string, string> = {
  workspace: 'nav.workspace',
  releases: 'nav.releases',
  features: 'nav.features',
  flags: 'nav.flags',
  settings: 'nav.settings',
}

function AppShellInner() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const { items } = useBreadcrumb()
  const segment = location.pathname.split('/').filter(Boolean)[0] ?? 'workspace'
  const pageTitle = t(ROUTE_KEYS[segment] ?? 'nav.workspace')

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <ProjectSwitcher />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <MainNav />
        </SidebarContent>

        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                {t('common.appName')}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              {items.length > 0 ? (
                items.map((item, index) => {
                  const isLast = index === items.length - 1
                  return (
                    <span key={item.label} className="inline-flex items-center gap-1.5">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {isLast || !item.to ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink render={<Link to={item.to} />}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </span>
                  )
                })
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppShell() {
  return (
    <BreadcrumbProvider>
      <AppShellInner />
    </BreadcrumbProvider>
  )
}
