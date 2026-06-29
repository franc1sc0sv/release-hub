import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IGitHubClient, type IGithubRepository } from '../../../integration/interfaces/github-client.interface'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import { ListGithubRepositoriesQuery } from './list-github-repositories.query'

@QueryHandler(ListGithubRepositoriesQuery)
export class ListGithubRepositoriesHandler extends BaseQueryHandler<ListGithubRepositoriesQuery, IGithubRepository[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly gitHubClient: IGitHubClient,
  ) {
    super(db)
  }

  protected async handle(query: ListGithubRepositoriesQuery, tx: TxClient): Promise<IGithubRepository[]> {
    const connection = await this.githubConnectionRepository.findByUserId(query.userId, tx)
    if (!connection) {
      throw new AppException(
        'GitHub is not connected. Please connect your GitHub account in settings.',
        ErrorCode.GITHUB_NOT_CONNECTED,
      )
    }

    const token = decryptToken(connection.accessToken)
    return this.gitHubClient.listUserRepositories(token)
  }
}
