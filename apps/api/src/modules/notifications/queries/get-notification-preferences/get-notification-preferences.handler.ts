import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
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
    private readonly organizationRepository: IOrganizationRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetNotificationPreferencesQuery,
    tx: TxClient,
  ): Promise<NotificationPreferenceEntryType[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

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
