import { registerEnumType } from '@nestjs/graphql'

export const NotificationType = {
  RELEASE_CREATED: 'release_created',
  RELEASE_SHIPPED: 'release_shipped',
  RELEASE_DEPLOYED: 'release_deployed',
  FLAG_IN_PROGRESS_REMINDER: 'flag_in_progress_reminder',
  FLAG_STALENESS_ALERT: 'flag_staleness_alert',
  FLAG_DIGEST: 'flag_digest',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

registerEnumType(NotificationType, { name: 'NotificationType' })
