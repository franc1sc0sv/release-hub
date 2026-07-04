import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { NotificationDispatcherService } from '../services/notification-dispatcher.service'
import { buildNotificationMessage } from '../providers/notification-message.util'
import { FlagWebhookTransition } from '../../integration/events/integration.events'
import type { FlagWebhookTransitionEvent } from '../../integration/events/flag-webhook-transition.event'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

const TRANSITION_NOTIFICATION_TYPE: Record<FlagWebhookTransition, NotificationType> = {
  [FlagWebhookTransition.CREATED]: NotificationType.FLAG_CREATED,
  [FlagWebhookTransition.ENABLED]: NotificationType.FLAG_ENABLED,
  [FlagWebhookTransition.DISABLED]: NotificationType.FLAG_DISABLED,
  [FlagWebhookTransition.DELETED]: NotificationType.FLAG_DELETED,
  [FlagWebhookTransition.VALUE_CHANGED]: NotificationType.FLAG_VALUE_CHANGED,
}

@Injectable()
export class NotificationFlagWebhookTransitionHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('flagsmith.flag.webhook-transition')
  async onFlagWebhookTransition(event: FlagWebhookTransitionEvent): Promise<void> {
    try {
      const type = TRANSITION_NOTIFICATION_TYPE[event.transition]
      const content = buildNotificationMessage(type, {
        flagKey: event.flagKey,
        environmentName: event.environmentName ?? undefined,
        previousValue: event.previousValue ?? undefined,
        newValue: event.newValue ?? undefined,
      })

      const payload: INotificationPayload = {
        type,
        title: content.title,
        bodyLines: [content.body],
        url: content.url,
        projectId: event.projectId,
        releaseId: null,
        flagIds: [],
        flagKey: event.flagKey,
      }

      await this.dispatcher.dispatchToProjectMembers(event.projectId, type, payload)
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          projectId: event.projectId,
          flagKey: event.flagKey,
          transition: event.transition,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
