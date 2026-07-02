import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'

export const NotificationTypeValue = {
  RELEASE_CREATED: 'RELEASE_CREATED',
  RELEASE_SHIPPED: 'RELEASE_SHIPPED',
  RELEASE_DEPLOYED: 'RELEASE_DEPLOYED',
  FLAG_IN_PROGRESS_REMINDER: 'FLAG_IN_PROGRESS_REMINDER',
  FLAG_STALENESS_ALERT: 'FLAG_STALENESS_ALERT',
  FLAG_DIGEST: 'FLAG_DIGEST',
} as const satisfies Record<NotificationType, NotificationType>

export const NOTIFICATION_TYPE_OPTIONS: NotificationType[] = [
  NotificationTypeValue.RELEASE_CREATED,
  NotificationTypeValue.RELEASE_SHIPPED,
  NotificationTypeValue.RELEASE_DEPLOYED,
  NotificationTypeValue.FLAG_IN_PROGRESS_REMINDER,
  NotificationTypeValue.FLAG_STALENESS_ALERT,
  NotificationTypeValue.FLAG_DIGEST,
]

export const NotificationChannelValue = {
  EMAIL: 'EMAIL',
  SLACK_DM: 'SLACK_DM',
} as const satisfies Record<NotificationChannel, NotificationChannel>

export const DigestFrequencyValue = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
} as const satisfies Record<DigestFrequency, DigestFrequency>

export const DIGEST_FREQUENCY_OPTIONS: DigestFrequency[] = [
  DigestFrequencyValue.DAILY,
  DigestFrequencyValue.WEEKLY,
]
