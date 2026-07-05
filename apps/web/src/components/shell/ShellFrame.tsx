import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
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
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

interface ShellFrameProps {
  sidebarHeader: ReactNode
  nav: ReactNode
  fallbackTitle: string
}

function ShellFrameInner({ sidebarHeader, nav, fallbackTitle }: ShellFrameProps) {
  const { t } = useTranslation('common')
  const { items } = useBreadcrumb()

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>{sidebarHeader}</SidebarMenu>
        </SidebarHeader>

        <SidebarContent>{nav}</SidebarContent>

        <SidebarFooter>
          <NotificationBell />
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
                  <BreadcrumbPage>{fallbackTitle}</BreadcrumbPage>
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

export function ShellFrame(props: ShellFrameProps) {
  return (
    <BreadcrumbProvider>
      <ShellFrameInner {...props} />
    </BreadcrumbProvider>
  )
}
