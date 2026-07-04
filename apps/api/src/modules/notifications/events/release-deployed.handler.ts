import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { NotificationDispatcherService } from '../services/notification-dispatcher.service'
import type { ReleaseDeployedEvent } from '../../release/events/release-deployed.event'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

@Injectable()
export class NotificationReleaseDeployedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('release.deployed')
  async onReleaseDeployed(event: ReleaseDeployedEvent): Promise<void> {
    try {
      const release = await this.db.$transaction((tx) => this.releaseRepository.findById(event.releaseId, tx))
      if (!release) return

      const payload: INotificationPayload = {
        type: NotificationType.RELEASE_DEPLOYED,
        title: `Release deployed: ${release.name ?? release.id}`,
        bodyLines: [`The release has been deployed.`],
        url: release.prUrl,
        projectId: event.projectId,
        releaseId: event.releaseId,
        flagIds: [],
        flagKey: null,
      }

      await Promise.all([
        this.dispatcher.dispatchToProjectMembers(event.projectId, NotificationType.RELEASE_DEPLOYED, payload),
        this.dispatcher.dispatchToProjectChannel(event.projectId, NotificationType.RELEASE_DEPLOYED, payload),
      ])
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          notificationType: NotificationType.RELEASE_DEPLOYED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
