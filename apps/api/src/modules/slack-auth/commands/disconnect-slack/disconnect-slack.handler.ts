import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISlackConnectionRepository } from '../../interfaces/slack-connection.repository'
import { DisconnectSlackCommand } from './disconnect-slack.command'

@CommandHandler(DisconnectSlackCommand)
export class DisconnectSlackHandler extends BaseCommandHandler<DisconnectSlackCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DisconnectSlackCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    await this.slackConnectionRepository.deleteByProject(command.projectId, tx)
    await this.slackConnectionRepository.setProjectSlackEnabled(command.projectId, false, tx)

    return true
  }
}
