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
import type { IProjectSlackConnection } from '../../interfaces/slack-connection.interfaces'
import { ConnectSlackCommand } from './connect-slack.command'

@CommandHandler(ConnectSlackCommand)
export class ConnectSlackHandler extends BaseCommandHandler<ConnectSlackCommand, IProjectSlackConnection> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ConnectSlackCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IProjectSlackConnection> {
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

    const connection = await this.slackConnectionRepository.upsertForProject(
      {
        projectId: command.projectId,
        encryptedAccessToken: command.encryptedAccessToken,
        slackTeamId: command.slackTeamId,
        slackTeamName: command.slackTeamName,
      },
      tx,
    )

    await this.slackConnectionRepository.setProjectSlackEnabled(command.projectId, true, tx)

    return connection
  }
}
