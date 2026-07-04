import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell as BellIcon, CheckCheck, Loader2 } from 'lucide-react'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { useNotifications } from '../hooks/use-notifications'
import { NotificationListItem } from './NotificationListItem'

const EXTERNAL_URL_PATTERN = /^https?:\/\//

interface NotificationsSheetContentProps {
  open: boolean
  unreadCount: number
  onNavigate: () => void
  onReadStateChange: () => void
}

export function NotificationsSheetContent({
  open,
  unreadCount,
  onNavigate,
  onReadStateChange,
}: NotificationsSheetContentProps) {
  const { t } = useTranslation('notifications')
  const navigate = useNavigate()
  const {
    items,
    totalCount,
    hasMore,
    loading,
    loadingMore,
    markingAllRead,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications(!open)

  const hasUnread = unreadCount > 0

  async function handleMarkAllRead(): Promise<void> {
    await markAllRead()
    onReadStateChange()
  }

  async function handleItemClick(id: string, url: string | null): Promise<void> {
    await markRead(id)
    onReadStateChange()
    if (url) {
      if (EXTERNAL_URL_PATTERN.test(url)) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(url)
      }
    }
    onNavigate()
  }

  return (
    <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <SheetTitle>{t('sheet.title')}</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleMarkAllRead()}
            disabled={markingAllRead || !hasUnread}
          >
            {markingAllRead ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
            ) : (
              <CheckCheck className="mr-1.5 size-3.5" aria-hidden />
            )}
            {t('sheet.markAllRead')}
          </Button>
        </div>
        <SheetDescription>{t('sheet.description', { count: totalCount })}</SheetDescription>
      </SheetHeader>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-3">
          {loading ? (
            Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-[var(--radius-card)]" />
            ))
          ) : items.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={<BellIcon className="size-6 text-brand-indigo-bright" aria-hidden />}
                heading={t('sheet.empty.heading')}
                description={t('sheet.empty.description')}
              />
            </div>
          ) : (
            items.map((item) => (
              <NotificationListItem
                key={item.id}
                notification={item}
                onClick={() => void handleItemClick(item.id, item.url ?? null)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {hasMore && (
        <div className="border-t border-border/60 p-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void loadMore()}
            disabled={loadingMore}
          >
            {loadingMore && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            {t('sheet.loadMore')}
          </Button>
        </div>
      )}
    </SheetContent>
  )
}
