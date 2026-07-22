import { NotificationChannel } from '../../../common/types/notification-channel.enum'

const DEFAULT_ENABLED_BY_CHANNEL: Record<NotificationChannel, boolean> = {
  [NotificationChannel.IN_APP]: true,
  [NotificationChannel.EMAIL]: false,
  [NotificationChannel.SLACK_DM]: false,
}

export function defaultEnabledForChannel(channel: NotificationChannel): boolean {
  return DEFAULT_ENABLED_BY_CHANNEL[channel]
}
