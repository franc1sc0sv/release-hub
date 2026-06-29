import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ILinearConnectionRepository } from '../../interfaces/linear-connection.repository'
import { DisconnectLinearCommand } from './disconnect-linear.command'

@CommandHandler(DisconnectLinearCommand)
export class DisconnectLinearHandler extends BaseCommandHandler<DisconnectLinearCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DisconnectLinearCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
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

    await this.linearConnectionRepository.deleteByProject(command.projectId, tx)
    await this.projectRepository.updateIntegrationSettings(
      command.projectId,
      { linearEnabled: false },
      tx,
    )

    return true
  }
}
