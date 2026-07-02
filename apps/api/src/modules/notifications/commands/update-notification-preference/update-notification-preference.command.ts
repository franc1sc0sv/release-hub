import type { NotificationType } from '../../../../common/types/notification-type.enum'
import type { NotificationChannel } from '../../../../common/types/notification-channel.enum'
import type { DigestFrequency } from '../../../../common/types/digest-frequency.enum'

export class UpdateNotificationPreferenceCommand {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly notificationType: NotificationType,
    readonly channel: NotificationChannel,
    readonly enabled: boolean,
    readonly digestFrequency: DigestFrequency | null,
  ) {}
}
