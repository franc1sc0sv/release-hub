import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import type { GithubConnectionStatus } from '../../types/github-connection-status.type'
import { GetGithubConnectionQuery } from './get-github-connection.query'

@QueryHandler(GetGithubConnectionQuery)
export class GetGithubConnectionHandler extends BaseQueryHandler<GetGithubConnectionQuery, GithubConnectionStatus> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetGithubConnectionQuery,
    tx: TxClient,
  ): Promise<GithubConnectionStatus> {
    const ability = defineAbilityFor([])
    if (!ability.can(Action.READ, Subject.USER)) {
      throw new ForbiddenException()
    }

    const connection = await this.githubConnectionRepository.findByUserId(query.userId, tx)
    return {
      connected: connection !== null,
      githubLogin: connection?.githubLogin ?? null,
    }
  }
}
