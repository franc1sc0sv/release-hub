import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { NotificationDispatcherService } from './notification-dispatcher.service'
import { buildNotificationMessage } from '../providers/notification-message.util'
import type {
  IProjectForDigest,
  IEnableOffConflictCandidate,
  INotificationPayload,
} from '../interfaces/notification.interfaces'

function buildConflictPayload(
  project: IProjectForDigest,
  candidate: IEnableOffConflictCandidate,
): INotificationPayload {
  const content = buildNotificationMessage(NotificationType.FLAG_CONFLICT, {
    flagKey: candidate.key,
    releaseName: candidate.releaseName,
  })
  return {
    type: NotificationType.FLAG_CONFLICT,
    title: content.title,
    bodyLines: [content.body],
    url: content.url,
    projectId: project.id,
    releaseId: candidate.releaseId,
    flagIds: [candidate.trackedFlagId],
    flagKey: candidate.key,
  }
}

@Injectable()
export class FlagEnableOffConflictService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async runConflictScanForProject(project: IProjectForDigest): Promise<void> {
    const candidates = await this.db.$transaction((tx) =>
      this.notificationReadRepository.findEnableButOffConflictCandidates(project.id, tx),
    )
    if (candidates.length === 0) return

    for (const candidate of candidates) {
      const payload = buildConflictPayload(project, candidate)
      await this.dispatcher.dispatchToProjectMembers(project.id, NotificationType.FLAG_CONFLICT, payload)
    }
  }
}
