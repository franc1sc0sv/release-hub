import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { decryptToken } from '../../../common/crypto/token-cipher'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { INotificationProvider, type INotificationTarget } from '../interfaces/notification-provider.abstract'
import { SlackHttpClient } from '../clients/slack-http.client'
import { formatNotificationMessage } from './notification-message.util'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class SlackDmProvider extends INotificationProvider {
  private readonly slackClient = new SlackHttpClient()

  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly logger: ILogger,
  ) {
    super()
  }

  async send(target: INotificationTarget, payload: INotificationPayload): Promise<void> {
    if (!target.email) return

    try {
      const connection = await this.db.$transaction((tx) =>
        this.notificationReadRepository.findSlackConnectionForProject(target.projectId, tx),
      )
      if (!connection) return

      const accessToken = decryptToken(connection.accessToken)

      const lookup = await this.slackClient.lookupUserByEmail(accessToken, target.email)
      if (!lookup.ok || !lookup.user) {
        this.logger.warn(
          {
            event: LogEvent.OPERATION_ERROR,
            channel: 'slack_dm',
            notificationType: payload.type,
            projectId: payload.projectId,
            slackError: lookup.error,
          },
          LogEvent.OPERATION_ERROR,
        )
        return
      }

      const conversation = await this.slackClient.openConversation(accessToken, lookup.user.id)
      if (!conversation.ok || !conversation.channel) {
        this.logger.warn(
          {
            event: LogEvent.OPERATION_ERROR,
            channel: 'slack_dm',
            notificationType: payload.type,
            projectId: payload.projectId,
            slackError: conversation.error,
          },
          LogEvent.OPERATION_ERROR,
        )
        return
      }

      const message = formatNotificationMessage(payload)
      const result = await this.slackClient.postMessage(accessToken, conversation.channel.id, message)

      if (!result.ok) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            channel: 'slack_dm',
            notificationType: payload.type,
            projectId: payload.projectId,
            slackError: result.error,
          },
          LogEvent.OPERATION_ERROR,
        )
      }
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          channel: 'slack_dm',
          notificationType: payload.type,
          projectId: payload.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
