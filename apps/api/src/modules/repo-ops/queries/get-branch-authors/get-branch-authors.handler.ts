import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
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
    private readonly githubConnectionRepository: IGithubConnectionRepository,
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
      const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
      const ability = defineAbilityFor(memberships)

      if (
        !ability.can(Action.READ, {
          kind: Subject.PROJECT,
          __type: Subject.PROJECT,
          projectId: query.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      const project = await this.projectRepository.findById(query.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const connection = await this.githubConnectionRepository.findByUserId(query.userId, tx)
      if (!connection) {
        throw new AppException(
          'GitHub is not connected. Please connect your GitHub account in settings.',
          ErrorCode.GITHUB_NOT_CONNECTED,
        )
      }

      return {
        repo: project.repo,
        accessToken: decryptToken(connection.accessToken),
      }
    })
  }
}
