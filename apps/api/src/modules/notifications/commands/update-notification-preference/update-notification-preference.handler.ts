import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { INotificationPreferenceRepository } from '../../interfaces/notification-preference.repository'
import { NotificationPreferenceEntryType } from '../../types/notification-preference.type'
import { DigestFrequency } from '../../../../common/types/digest-frequency.enum'
import { UpdateNotificationPreferenceCommand } from './update-notification-preference.command'

@CommandHandler(UpdateNotificationPreferenceCommand)
export class UpdateNotificationPreferenceHandler extends BaseCommandHandler<
  UpdateNotificationPreferenceCommand,
  NotificationPreferenceEntryType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateNotificationPreferenceCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<NotificationPreferenceEntryType> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const updated = await this.notificationPreferenceRepository.upsert(
      {
        userId: command.userId,
        projectId: command.projectId,
        notificationType: command.notificationType,
        channel: command.channel,
        enabled: command.enabled,
        digestFrequency: command.digestFrequency,
      },
      tx,
    )

    const entry = new NotificationPreferenceEntryType()
    entry.notificationType = updated.notificationType
    entry.channel = updated.channel
    entry.enabled = updated.enabled
    entry.digestFrequency = updated.digestFrequency ?? DigestFrequency.WEEKLY
    return entry
  }
}
