import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectDeletedEvent } from '../../events/project-deleted.event'
import { DeleteProjectCommand } from './delete-project.command'

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler extends BaseCommandHandler<DeleteProjectCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DeleteProjectCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<boolean> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.DELETE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: command.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const existing = await this.projectRepository.findById(command.projectId, tx)
    if (!existing) throw new NotFoundException('Project')

    await this.projectRepository.delete(command.projectId, tx)

    events.push(new ProjectDeletedEvent(command.projectId))

    return true
  }
}
