import { Outlet, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Rocket } from 'lucide-react'
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
  SidebarMenuButton,
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

const ROUTE_KEYS: Record<string, string> = {
  dashboard: 'nav.dashboard',
}

function AppShellInner() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const { items } = useBreadcrumb()
  const segment = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard'
  const pageTitle = t(ROUTE_KEYS[segment] ?? 'nav.dashboard')

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Rocket className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Release Hub</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t('common.schoolManagement')}
                  </span>
                </div>
              </SidebarMenuButton>
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
                Release Hub
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
