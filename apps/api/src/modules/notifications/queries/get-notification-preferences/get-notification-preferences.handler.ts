import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { INotificationPreferenceRepository } from '../../interfaces/notification-preference.repository'
import { NotificationType } from '../../../../common/types/notification-type.enum'
import { NotificationChannel } from '../../../../common/types/notification-channel.enum'
import { DigestFrequency } from '../../../../common/types/digest-frequency.enum'
import { NotificationPreferenceEntryType } from '../../types/notification-preference.type'
import { GetNotificationPreferencesQuery } from './get-notification-preferences.query'

const ALL_NOTIFICATION_TYPES = Object.values(NotificationType)
const ALL_NOTIFICATION_CHANNELS = Object.values(NotificationChannel)

@QueryHandler(GetNotificationPreferencesQuery)
export class GetNotificationPreferencesHandler extends BaseQueryHandler<
  GetNotificationPreferencesQuery,
  NotificationPreferenceEntryType[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetNotificationPreferencesQuery,
    tx: TxClient,
  ): Promise<NotificationPreferenceEntryType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const existing = await this.notificationPreferenceRepository.findAllForUserAndProject(
      query.userId,
      query.projectId,
      tx,
    )

    const matrix: NotificationPreferenceEntryType[] = []
    for (const notificationType of ALL_NOTIFICATION_TYPES) {
      for (const channel of ALL_NOTIFICATION_CHANNELS) {
        const match = existing.find(
          (pref) => pref.notificationType === notificationType && pref.channel === channel,
        )
        const entry = new NotificationPreferenceEntryType()
        entry.notificationType = notificationType
        entry.channel = channel
        entry.enabled = match?.enabled ?? true
        entry.digestFrequency = match?.digestFrequency ?? DigestFrequency.WEEKLY
        matrix.push(entry)
      }
    }

    return matrix
  }
}
