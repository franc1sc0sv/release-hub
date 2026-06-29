import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectType } from '../../types/project.type'
import { toProjectType } from '../../types/project.mappers'
import { ProjectUpdatedEvent } from '../../events/project-updated.event'
import { UpdateProjectCommand } from './update-project.command'

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler extends BaseCommandHandler<UpdateProjectCommand, ProjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateProjectCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ProjectType> {
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

    const existing = await this.projectRepository.findById(command.projectId, tx)
    if (!existing) throw new NotFoundException('Project')

    const project = await this.projectRepository.update(
      command.projectId,
      { name: command.name, repo: command.repo },
      tx,
    )

    events.push(new ProjectUpdatedEvent(project.id))

    return toProjectType(project)
  }
}
