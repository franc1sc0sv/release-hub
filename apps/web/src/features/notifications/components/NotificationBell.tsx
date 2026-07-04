import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import { useUnreadNotificationsCount } from '../hooks/use-unread-notifications-count'
import { NotificationsSheetContent } from './NotificationsSheetContent'

const MAX_DISPLAY_COUNT = 99

export function NotificationBell() {
  const { t } = useTranslation('notifications')
  const [open, setOpen] = useState(false)
  const { unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationsCount()

  const badgeLabel = unreadCount > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : String(unreadCount)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SheetTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={t('bell.tooltip')}
                aria-label={t('bell.ariaLabel', { count: unreadCount })}
              />
            }
          >
            <Bell className="!size-5" aria-hidden />
            <span>{t('bell.label')}</span>
          </SheetTrigger>
          {unreadCount > 0 && (
            <SidebarMenuBadge
              className="rounded-full bg-brand-magenta px-1.5 text-[10px] font-semibold text-white"
              aria-hidden
            >
              {badgeLabel}
            </SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
      <NotificationsSheetContent
        open={open}
        unreadCount={unreadCount}
        onNavigate={() => setOpen(false)}
        onReadStateChange={() => void refetchUnreadCount()}
      />
    </Sheet>
  )
}
