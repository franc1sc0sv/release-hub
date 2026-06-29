import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { ReauthorizeGithubCommand } from './reauthorize-github.command'

@CommandHandler(ReauthorizeGithubCommand)
export class ReauthorizeGithubHandler implements ICommandHandler<ReauthorizeGithubCommand, boolean> {
  constructor(
    private readonly db: IDatabaseService,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly gitHubClient: IGitHubClient,
  ) {}

  async execute(command: ReauthorizeGithubCommand): Promise<boolean> {
    const connection = await this.db.$transaction((tx) =>
      this.githubConnectionRepository.findByUserId(command.userId, tx),
    )

    if (!connection) return true

    const accessToken = decryptToken(connection.accessToken)
    await this.gitHubClient.revokeAuthorization(accessToken)

    return true
  }
}
