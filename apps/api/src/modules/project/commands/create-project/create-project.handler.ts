import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectType } from '../../types/project.type'
import { toProjectType } from '../../types/project.mappers'
import { ProjectCreatedEvent } from '../../events/project-created.event'
import { CreateProjectCommand } from './create-project.command'

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler extends BaseCommandHandler<CreateProjectCommand, ProjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateProjectCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ProjectType> {
    const project = await this.projectRepository.create(
      { name: command.name, repo: command.repo, ownerId: command.userId },
      tx,
    )

    await this.projectRepository.createDefaultFeatures(project.id, tx)

    events.push(new ProjectCreatedEvent(project.id))

    return toProjectType(project)
  }
}
