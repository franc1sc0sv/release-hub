import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGithubTokenResolver } from '../../interfaces/github-token-resolver.abstract'
import { IGitHubClient } from '../../interfaces/github-client.interface'
import { RepoFileSearchQuery } from './repo-file-search.query'

@QueryHandler(RepoFileSearchQuery)
export class RepoFileSearchHandler extends BaseQueryHandler<RepoFileSearchQuery, string[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db)
  }

  protected async handle(query: RepoFileSearchQuery, tx: TxClient): Promise<string[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.tokenResolver.resolveForProject(query.projectId, query.userId, tx)

    const branch = query.branch ?? (await this.gitHubClient.getDefaultBranch(project.repo, accessToken))

    const tree = await this.gitHubClient.getFileTree(project.repo, branch, accessToken)

    const needle = query.query.toLowerCase()
    return tree.paths.filter((path) => path.toLowerCase().includes(needle)).slice(0, query.limit)
  }
}
