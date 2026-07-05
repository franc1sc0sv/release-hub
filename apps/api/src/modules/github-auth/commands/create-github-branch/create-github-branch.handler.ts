import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient, type IGitHubBranch } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { CreateGithubBranchCommand } from './create-github-branch.command'

@CommandHandler(CreateGithubBranchCommand)
export class CreateGithubBranchHandler extends BaseCommandHandler<CreateGithubBranchCommand, IGitHubBranch> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateGithubBranchCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IGitHubBranch> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.CREATE,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.tokenResolver.resolveForProject(command.projectId, command.userId, tx)
    return this.gitHubClient.createBranch(project.repo, command.name, command.fromRef, accessToken)
  }
}
