import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient, type IGitHubBranch } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { ListGithubBranchesQuery } from './list-github-branches.query'

@QueryHandler(ListGithubBranchesQuery)
export class ListGithubBranchesHandler extends BaseQueryHandler<ListGithubBranchesQuery, IGitHubBranch[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db)
  }

  protected async handle(query: ListGithubBranchesQuery, tx: TxClient): Promise<IGitHubBranch[]> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.tokenResolver.resolveForProject(query.projectId, query.userId, tx)
    return this.gitHubClient.listBranches(project.repo, accessToken)
  }
}
