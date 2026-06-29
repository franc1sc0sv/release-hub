import type { IDatabaseService } from '../database/database.abstract'
import type { IEventEmitter } from '../events/event-emitter.abstract'
import type { IDomainEvent, TxClient } from './types'

export abstract class PreparedCommandHandler<TCommand, TPrepared, TResult = void> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(command: TCommand): Promise<TResult> {
    const events: IDomainEvent[] = []
    const prepared = await this.prepare(command)
    const result = await this.db.$transaction((tx) =>
      this.handle(command, tx, events, prepared),
    )
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event)
    }
    return result
  }

  protected abstract prepare(command: TCommand): Promise<TPrepared>

  protected abstract handle(
    command: TCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: TPrepared,
  ): Promise<TResult>
}
