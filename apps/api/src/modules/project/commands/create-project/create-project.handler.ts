import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
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
    private readonly orgRepository: IOrganizationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateProjectCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ProjectType> {
    await authorizeOrgAction(
      this.orgRepository,
      {
        actorId: command.userId,
        organizationId: command.organizationId,
        action: Action.CREATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.create(
      {
        name: command.name,
        repo: command.repo,
        organizationId: command.organizationId,
        githubInstallationId: command.githubInstallationId,
      },
      tx,
    )

    await this.projectRepository.createDefaultFeatures(project.id, tx)

    events.push(new ProjectCreatedEvent(project.id))

    return toProjectType(project)
  }
}
