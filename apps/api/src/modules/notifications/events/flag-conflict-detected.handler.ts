import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { NotificationDispatcherService } from '../services/notification-dispatcher.service'
import { buildNotificationMessage } from '../providers/notification-message.util'
import type { FlagConflictDetectedEvent } from '../../integration/events/flag-conflict-detected.event'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class NotificationFlagConflictDetectedHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('flagsmith.flag.conflict-detected')
  async onFlagConflictDetected(event: FlagConflictDetectedEvent): Promise<void> {
    try {
      const content = buildNotificationMessage(NotificationType.FLAG_CONFLICT, {
        flagKey: event.flagKey,
        environmentName: event.environmentName,
        releaseName: event.releaseName ?? undefined,
      })
      const payload: INotificationPayload = {
        type: NotificationType.FLAG_CONFLICT,
        title: content.title,
        bodyLines: [content.body],
        url: content.url,
        projectId: event.projectId,
        releaseId: event.releaseId,
        flagIds: [],
        flagKey: event.flagKey,
      }

      await this.dispatcher.dispatchToProjectMembers(event.projectId, NotificationType.FLAG_CONFLICT, payload)
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          projectId: event.projectId,
          flagKey: event.flagKey,
          releaseId: event.releaseId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
