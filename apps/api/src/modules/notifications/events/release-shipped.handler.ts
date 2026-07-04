import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { NotificationDispatcherService } from '../services/notification-dispatcher.service'
import type { ReleaseShippedEvent } from '../../release/events/release-shipped.event'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class NotificationReleaseShippedHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('release.shipped')
  async onReleaseShipped(event: ReleaseShippedEvent): Promise<void> {
    try {
      const payload: INotificationPayload = {
        type: NotificationType.RELEASE_SHIPPED,
        title: `Release shipped: ${event.tag}`,
        bodyLines: [`The release was shipped as ${event.tag}.`],
        url: event.prUrl,
        projectId: event.projectId,
        releaseId: event.releaseId,
        flagIds: [],
        flagKey: null,
      }

      await Promise.all([
        this.dispatcher.dispatchToProjectMembers(event.projectId, NotificationType.RELEASE_SHIPPED, payload),
        this.dispatcher.dispatchToProjectChannel(event.projectId, NotificationType.RELEASE_SHIPPED, payload),
      ])
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          notificationType: NotificationType.RELEASE_SHIPPED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
