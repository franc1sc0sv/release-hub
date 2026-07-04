import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { NOTIFICATION_TYPE_ICON } from '../constants/notification-icons'
import type { NotificationsQuery } from '@/generated/graphql'

type NotificationEntry = NotificationsQuery['notifications']['items'][number]

interface NotificationListItemProps {
  notification: NotificationEntry
  onClick: () => void
}

export function NotificationListItem({ notification, onClick }: NotificationListItemProps) {
  const { t, i18n } = useTranslation('notifications')
  const locale = i18n.language.startsWith('es') ? es : enUS
  const Icon = NOTIFICATION_TYPE_ICON[notification.type]
  const isUnread = !notification.readAt

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-[var(--radius-card)] p-3 text-left transition-colors hover:bg-accent/40',
        isUnread && 'bg-brand-indigo-bright/10',
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
        <Icon className="size-4 text-indigo-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
          {isUnread && <span className="size-1.5 shrink-0 rounded-full bg-brand-magenta" aria-hidden />}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{notification.projectName}</span>
          <span aria-hidden>·</span>
          <time dateTime={notification.createdAt}>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale })}
          </time>
        </div>
      </div>
      {isUnread && <span className="sr-only">{t('listItem.unread')}</span>}
    </button>
  )
}
