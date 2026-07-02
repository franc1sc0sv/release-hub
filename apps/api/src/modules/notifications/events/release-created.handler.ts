import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { NotificationDispatcherService } from '../services/notification-dispatcher.service'
import type { ReleaseCreatedEvent } from '../../release/events/release-created.event'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class NotificationReleaseCreatedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('release.created')
  async onReleaseCreated(event: ReleaseCreatedEvent): Promise<void> {
    try {
      const release = await this.db.$transaction((tx) => this.releaseRepository.findById(event.releaseId, tx))
      if (!release) return

      const payload: INotificationPayload = {
        type: NotificationType.RELEASE_CREATED,
        title: `New release draft: ${release.name ?? release.id}`,
        bodyLines: [`A new release draft was created for this project.`],
        url: null,
        projectId: event.projectId,
        releaseId: event.releaseId,
        flagIds: [],
      }

      await Promise.all([
        this.dispatcher.dispatchToProjectMembers(event.projectId, NotificationType.RELEASE_CREATED, payload),
        this.dispatcher.dispatchToProjectChannel(event.projectId, NotificationType.RELEASE_CREATED, payload),
      ])
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          notificationType: NotificationType.RELEASE_CREATED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
