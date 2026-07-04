import { registerEnumType } from '@nestjs/graphql'

export const NotificationType = {
  RELEASE_CREATED: 'release_created',
  RELEASE_SHIPPED: 'release_shipped',
  RELEASE_DEPLOYED: 'release_deployed',
  FLAG_IN_PROGRESS_REMINDER: 'flag_in_progress_reminder',
  FLAG_STALENESS_ALERT: 'flag_staleness_alert',
  FLAG_DIGEST: 'flag_digest',
  FLAG_CREATED: 'flag_created',
  FLAG_DELETED: 'flag_deleted',
  FLAG_ENABLED: 'flag_enabled',
  FLAG_DISABLED: 'flag_disabled',
  FLAG_VALUE_CHANGED: 'flag_value_changed',
  FLAG_CONFLICT: 'flag_conflict',
  FLAG_SHIP_OFF_REMINDER: 'flag_ship_off_reminder',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

registerEnumType(NotificationType, { name: 'NotificationType' })
