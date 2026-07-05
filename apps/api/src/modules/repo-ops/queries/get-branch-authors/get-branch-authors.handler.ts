import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { fetchBranchCommitDetails } from '../../utils/fetch-branch-commit-details.util'
import { GetBranchAuthorsQuery } from './get-branch-authors.query'

interface IResolvedBranchAuthorsSource {
  repo: string
  accessToken: string
}

@QueryHandler(GetBranchAuthorsQuery)
export class GetBranchAuthorsHandler implements IQueryHandler<GetBranchAuthorsQuery, string[]> {
  constructor(
    private readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: GetBranchAuthorsQuery): Promise<string[]> {
    const { repo, accessToken } = await this.resolveSource(query)

    const branches = await this.gitHubClient.listBranches(repo, accessToken)
    const commitDetails = await fetchBranchCommitDetails(
      this.gitHubClient,
      repo,
      accessToken,
      branches.map((branch) => branch.name),
    )

    const authorsByKey = new Map<string, string>()
    for (const detail of commitDetails.values()) {
      const author = detail?.authorLogin ?? detail?.authorName
      if (!author) continue
      const key = author.toLowerCase()
      if (!authorsByKey.has(key)) authorsByKey.set(key, author)
    }

    return Array.from(authorsByKey.values()).sort((a, b) => a.localeCompare(b))
  }

  private async resolveSource(query: GetBranchAuthorsQuery): Promise<IResolvedBranchAuthorsSource> {
    return this.db.$query(async (tx) => {
      await authorizeProjectAction(
        this.organizationRepository,
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

      return {
        repo: project.repo,
        accessToken,
      }
    })
  }
}
