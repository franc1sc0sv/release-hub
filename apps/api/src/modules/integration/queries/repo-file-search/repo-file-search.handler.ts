import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient } from '../../interfaces/github-client.interface'
import { RepoFileSearchQuery } from './repo-file-search.query'

@QueryHandler(RepoFileSearchQuery)
export class RepoFileSearchHandler extends BaseQueryHandler<RepoFileSearchQuery, string[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(query: RepoFileSearchQuery, tx: TxClient): Promise<string[]> {
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

    const accessToken = await this.resolveAccessToken(query.userId, tx)

    const branch = query.branch ?? (await this.gitHubClient.getDefaultBranch(project.repo, accessToken))

    const tree = await this.gitHubClient.getFileTree(project.repo, branch, accessToken)

    const needle = query.query.toLowerCase()
    return tree.paths.filter((path) => path.toLowerCase().includes(needle)).slice(0, query.limit)
  }

  private async resolveAccessToken(userId: string, tx: TxClient): Promise<string> {
    const connection = await this.githubConnectionRepository.findByUserId(userId, tx)
    if (!connection) {
      throw new AppException(
        'GitHub is not connected. Please connect your GitHub account in settings.',
        ErrorCode.GITHUB_NOT_CONNECTED,
      )
    }
    return decryptToken(connection.accessToken)
  }
}
