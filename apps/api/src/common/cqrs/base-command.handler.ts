import type { IDatabaseService } from '../database/database.abstract'
import type { IEventEmitter } from '../events/event-emitter.abstract'
import type { IDomainEvent, TxClient } from './types'

export abstract class BaseCommandHandler<TCommand, TResult = void> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(command: TCommand): Promise<TResult> {
    const events: IDomainEvent[] = []
    const result = await this.db.$transaction((tx) =>
      this.handle(command, tx, events),
    )
    for (const event of events) {
      this.eventEmitter.emit(event.eventName, event)
    }
    return result
  }

  protected abstract handle(
    command: TCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<TResult>
}
