import { Injectable } from '@nestjs/common'
import { FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { IFlagHistoryRepository } from '../../flag-tracking/interfaces/flag-history.repository'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { NotificationDispatcherService } from './notification-dispatcher.service'
import { buildNotificationMessage } from '../providers/notification-message.util'
import type {
  IProjectForDigest,
  IShipOffReminderCandidate,
  INotificationPayload,
} from '../interfaces/notification.interfaces'

function buildShipOffReminderPayload(
  project: IProjectForDigest,
  candidate: IShipOffReminderCandidate,
): INotificationPayload {
  const content = buildNotificationMessage(NotificationType.FLAG_SHIP_OFF_REMINDER, { flagKey: candidate.key })
  return {
    type: NotificationType.FLAG_SHIP_OFF_REMINDER,
    title: content.title,
    bodyLines: [content.body],
    url: content.url,
    projectId: project.id,
    releaseId: null,
    flagIds: [candidate.trackedFlagId],
    flagKey: candidate.key,
  }
}

@Injectable()
export class FlagShipOffReminderService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async runShipOffReminderScanForProject(project: IProjectForDigest): Promise<void> {
    const candidates = await this.db.$transaction((tx) =>
      this.notificationReadRepository.findShipOffReminderCandidates(
        project.id,
        project.flagReminderIntervalDays,
        tx,
      ),
    )
    if (candidates.length === 0) return

    for (const candidate of candidates) {
      const payload = buildShipOffReminderPayload(project, candidate)
      await this.dispatcher.dispatchToProjectMembers(project.id, NotificationType.FLAG_SHIP_OFF_REMINDER, payload)

      const remindedAt = new Date()
      await this.db.$transaction(async (tx) => {
        await this.notificationReadRepository.stampFlagRemindedAt(candidate.trackedFlagId, remindedAt, tx)
        await this.flagHistoryRepository.create(
          {
            projectId: project.id,
            flagKey: candidate.key,
            trackedFlagId: candidate.trackedFlagId,
            type: FlagHistoryEventType.reminder_sent,
            source: FlagHistorySource.system,
            occurredAt: remindedAt,
          },
          tx,
        )
      })
    }
  }
}
