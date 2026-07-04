import type { LucideIcon } from 'lucide-react'
import {
  Rocket,
  Send,
  CloudUpload,
  PlusCircle,
  Trash2,
  ToggleRight,
  ToggleLeft,
  PenLine,
  AlertTriangle,
  Clock,
  ShieldOff,
  AlertCircle,
  Mail,
} from 'lucide-react'
import { NotificationTypeValue } from '@/lib/notification-enums'
import type { NotificationType } from '@/generated/graphql'

export const NOTIFICATION_TYPE_ICON: Record<NotificationType, LucideIcon> = {
  [NotificationTypeValue.RELEASE_CREATED]: Rocket,
  [NotificationTypeValue.RELEASE_SHIPPED]: Send,
  [NotificationTypeValue.RELEASE_DEPLOYED]: CloudUpload,
  [NotificationTypeValue.FLAG_CREATED]: PlusCircle,
  [NotificationTypeValue.FLAG_DELETED]: Trash2,
  [NotificationTypeValue.FLAG_ENABLED]: ToggleRight,
  [NotificationTypeValue.FLAG_DISABLED]: ToggleLeft,
  [NotificationTypeValue.FLAG_VALUE_CHANGED]: PenLine,
  [NotificationTypeValue.FLAG_CONFLICT]: AlertTriangle,
  [NotificationTypeValue.FLAG_IN_PROGRESS_REMINDER]: Clock,
  [NotificationTypeValue.FLAG_SHIP_OFF_REMINDER]: ShieldOff,
  [NotificationTypeValue.FLAG_STALENESS_ALERT]: AlertCircle,
  [NotificationTypeValue.FLAG_DIGEST]: Mail,
}
