import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import type { IGithubConnection } from '../../interfaces/github-connection.interfaces'
import { ConnectGithubCommand } from './connect-github.command'

@CommandHandler(ConnectGithubCommand)
export class ConnectGithubHandler extends BaseCommandHandler<ConnectGithubCommand, IGithubConnection> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ConnectGithubCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IGithubConnection> {
    return this.githubConnectionRepository.upsertForUser(
      {
        userId: command.userId,
        encryptedAccessToken: command.encryptedAccessToken,
        refreshToken: command.refreshToken,
        expiresAt: command.expiresAt,
        githubUserId: command.githubUserId,
        githubLogin: command.githubLogin,
        scopes: command.scopes,
      },
      tx,
    )
  }
}
