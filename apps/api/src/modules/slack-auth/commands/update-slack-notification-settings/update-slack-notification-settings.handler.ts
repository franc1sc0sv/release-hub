import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISlackConnectionRepository } from '../../interfaces/slack-connection.repository'
import { SlackConnectionStatus } from '../../types/slack-connection-status.type'
import { UpdateSlackNotificationSettingsCommand } from './update-slack-notification-settings.command'

@CommandHandler(UpdateSlackNotificationSettingsCommand)
export class UpdateSlackNotificationSettingsHandler extends BaseCommandHandler<
  UpdateSlackNotificationSettingsCommand,
  SlackConnectionStatus
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateSlackNotificationSettingsCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<SlackConnectionStatus> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: command.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const existing = await this.slackConnectionRepository.findByProject(command.projectId, tx)
    if (!existing) throw new NotFoundException('SlackConnection')

    const connection = await this.slackConnectionRepository.updateNotificationSettings(
      command.projectId,
      {
        notifyOnCreated: command.notifyOnCreated,
        notifyOnShipped: command.notifyOnShipped,
        notifyOnDeployed: command.notifyOnDeployed,
      },
      tx,
    )

    const status = new SlackConnectionStatus()
    status.connected = true
    status.teamName = connection.slackTeamName
    status.channelId = connection.channelId
    status.channelName = connection.channelName
    status.notifyOnCreated = connection.notifyOnCreated
    status.notifyOnShipped = connection.notifyOnShipped
    status.notifyOnDeployed = connection.notifyOnDeployed
    return status
  }
}
