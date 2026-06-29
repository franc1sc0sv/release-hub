import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import { DisconnectGithubCommand } from './disconnect-github.command'

@CommandHandler(DisconnectGithubCommand)
export class DisconnectGithubHandler extends BaseCommandHandler<DisconnectGithubCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DisconnectGithubCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    await this.githubConnectionRepository.deleteByUserId(command.userId, tx)
    return true
  }
}
