import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { DigestFrequency } from '../../../common/types/digest-frequency.enum'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { NotificationDispatcherService } from './notification-dispatcher.service'
import type { INotificationPayload, IProjectForDigest } from '../interfaces/notification.interfaces'

const DAILY_WINDOW_DAYS = 1
const WEEKLY_WINDOW_DAYS = 7

function buildDigestPayload(
  project: IProjectForDigest,
  enabledProdFlagKeys: string[],
  inProgressFlagKeys: string[],
  deployedReleaseNames: string[],
): INotificationPayload {
  const bodyLines: string[] = []

  bodyLines.push(
    enabledProdFlagKeys.length > 0
      ? `Flags enabled in production: ${enabledProdFlagKeys.join(', ')}`
      : 'No flags currently enabled in production.',
  )
  bodyLines.push(
    inProgressFlagKeys.length > 0
      ? `Flags in progress: ${inProgressFlagKeys.join(', ')}`
      : 'No flags currently in progress.',
  )
  bodyLines.push(
    deployedReleaseNames.length > 0
      ? `Releases deployed this period: ${deployedReleaseNames.join(', ')}`
      : 'No releases deployed this period.',
  )

  return {
    type: NotificationType.FLAG_DIGEST,
    title: `${project.name} flag digest`,
    bodyLines,
    url: null,
    projectId: project.id,
    releaseId: null,
    flagIds: [],
    flagKey: null,
  }
}

@Injectable()
export class FlagDigestService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async sendDigestForProject(project: IProjectForDigest, frequency: DigestFrequency): Promise<void> {
    const windowDays = frequency === DigestFrequency.DAILY ? DAILY_WINDOW_DAYS : WEEKLY_WINDOW_DAYS
    const since = new Date()
    since.setDate(since.getDate() - windowDays)

    const { members, enabledProdFlags, inProgressFlags, deployedReleases } = await this.db.$transaction(
      async (tx) => {
        return {
          members: await this.notificationReadRepository.findMembersForProject(project.id, tx),
          enabledProdFlags: await this.notificationReadRepository.findEnabledProdFlagsForProject(
            project.id,
            tx,
          ),
          inProgressFlags: await this.notificationReadRepository.findInProgressFlagsForProject(
            project.id,
            tx,
          ),
          deployedReleases: await this.notificationReadRepository.findReleasesDeployedInWindow(
            project.id,
            since,
            tx,
          ),
        }
      },
    )

    const payload = buildDigestPayload(
      project,
      enabledProdFlags.map((flag) => flag.key),
      inProgressFlags.map((flag) => flag.key),
      deployedReleases.map((release) => release.name ?? release.releaseId),
    )

    await Promise.all(
      members.map((member) => this.dispatcher.dispatchDigestToMember(member, frequency, payload)),
    )
  }
}
