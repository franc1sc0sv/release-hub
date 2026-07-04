import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { NotificationDispatcherService } from './notification-dispatcher.service'
import type {
  IProjectForDigest,
  IStaleFlagCandidate,
  INotificationPayload,
} from '../interfaces/notification.interfaces'

function buildStalenessPayload(project: IProjectForDigest, candidates: IStaleFlagCandidate[]): INotificationPayload {
  return {
    type: NotificationType.FLAG_STALENESS_ALERT,
    title: `${project.name}: stale in-progress flags`,
    bodyLines: [
      `The following flags have been in progress for more than ${project.flagStaleDays} days: ${candidates
        .map((candidate) => candidate.key)
        .join(', ')}`,
    ],
    url: null,
    projectId: project.id,
    releaseId: null,
    flagIds: candidates.map((candidate) => candidate.trackedFlagId),
    flagKey: null,
  }
}

@Injectable()
export class FlagStalenessService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async runStalenessScanForProject(project: IProjectForDigest): Promise<void> {
    const candidates = await this.db.$transaction((tx) =>
      this.notificationReadRepository.findStaleInProgressFlags(project.id, project.flagStaleDays, tx),
    )
    if (candidates.length === 0) return

    const payload = buildStalenessPayload(project, candidates)
    await this.dispatcher.dispatchToProjectMembers(project.id, NotificationType.FLAG_STALENESS_ALERT, payload)

    const remindedAt = new Date()
    await this.db.$transaction(async (tx) => {
      for (const candidate of candidates) {
        await this.notificationReadRepository.stampFlagRemindedAt(candidate.trackedFlagId, remindedAt, tx)
      }
    })
  }
}
