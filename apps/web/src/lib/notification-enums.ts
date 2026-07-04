import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'

export const NotificationTypeValue = {
  RELEASE_CREATED: 'RELEASE_CREATED',
  RELEASE_SHIPPED: 'RELEASE_SHIPPED',
  RELEASE_DEPLOYED: 'RELEASE_DEPLOYED',
  FLAG_CREATED: 'FLAG_CREATED',
  FLAG_DELETED: 'FLAG_DELETED',
  FLAG_ENABLED: 'FLAG_ENABLED',
  FLAG_DISABLED: 'FLAG_DISABLED',
  FLAG_VALUE_CHANGED: 'FLAG_VALUE_CHANGED',
  FLAG_CONFLICT: 'FLAG_CONFLICT',
  FLAG_IN_PROGRESS_REMINDER: 'FLAG_IN_PROGRESS_REMINDER',
  FLAG_SHIP_OFF_REMINDER: 'FLAG_SHIP_OFF_REMINDER',
  FLAG_STALENESS_ALERT: 'FLAG_STALENESS_ALERT',
  FLAG_DIGEST: 'FLAG_DIGEST',
} as const satisfies Record<NotificationType, NotificationType>

export const RELEASE_NOTIFICATION_TYPES: NotificationType[] = [
  NotificationTypeValue.RELEASE_CREATED,
  NotificationTypeValue.RELEASE_SHIPPED,
  NotificationTypeValue.RELEASE_DEPLOYED,
]

export const FLAG_NOTIFICATION_TYPES: NotificationType[] = [
  NotificationTypeValue.FLAG_CREATED,
  NotificationTypeValue.FLAG_DELETED,
  NotificationTypeValue.FLAG_ENABLED,
  NotificationTypeValue.FLAG_DISABLED,
  NotificationTypeValue.FLAG_VALUE_CHANGED,
  NotificationTypeValue.FLAG_CONFLICT,
  NotificationTypeValue.FLAG_IN_PROGRESS_REMINDER,
  NotificationTypeValue.FLAG_SHIP_OFF_REMINDER,
  NotificationTypeValue.FLAG_STALENESS_ALERT,
  NotificationTypeValue.FLAG_DIGEST,
]

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  ...RELEASE_NOTIFICATION_TYPES,
  ...FLAG_NOTIFICATION_TYPES,
]

export const NotificationChannelValue = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  SLACK_DM: 'SLACK_DM',
} as const satisfies Record<NotificationChannel, NotificationChannel>

export const NOTIFICATION_CHANNEL_OPTIONS: NotificationChannel[] = [
  NotificationChannelValue.IN_APP,
  NotificationChannelValue.EMAIL,
  NotificationChannelValue.SLACK_DM,
]

export const DigestFrequencyValue = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const satisfies Record<DigestFrequency, DigestFrequency>

export const DIGEST_FREQUENCY_OPTIONS: DigestFrequency[] = [
  DigestFrequencyValue.DAILY,
  DigestFrequencyValue.WEEKLY,
]
