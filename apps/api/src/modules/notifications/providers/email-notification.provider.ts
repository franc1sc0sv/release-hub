import { Injectable } from '@nestjs/common'
import { IMailService } from '../../../common/mail/mail.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { INotificationProvider, type INotificationTarget } from '../interfaces/notification-provider.abstract'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class EmailNotificationProvider extends INotificationProvider {
  constructor(
    private readonly mailService: IMailService,
    private readonly logger: ILogger,
  ) {
    super()
  }

  async send(target: INotificationTarget, payload: INotificationPayload): Promise<void> {
    if (!target.email) return

    try {
      await this.mailService.sendNotification(
        target.email,
        payload.title,
        payload.title,
        payload.bodyLines,
        payload.url,
      )
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          channel: 'email',
          notificationType: payload.type,
          projectId: payload.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
