import { registerEnumType } from '@nestjs/graphql'

export const NotificationChannel = {
  EMAIL: 'email',
  SLACK_DM: 'slack_dm',
} as const

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel]

registerEnumType(NotificationChannel, { name: 'NotificationChannel' })
