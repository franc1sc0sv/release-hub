import type { IDatabaseService } from '../database/database.abstract'
import type { TxClient } from './types'

export abstract class BaseQueryHandler<TQuery, TResult> {
  constructor(protected readonly db: IDatabaseService) {}

  async execute(query: TQuery): Promise<TResult> {
    return this.db.$transaction((tx) => this.handle(query, tx))
  }

  protected abstract handle(query: TQuery, tx: TxClient): Promise<TResult>
}
