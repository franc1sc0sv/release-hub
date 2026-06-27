export type { TxClient } from '@release-hub/db'
import type { TxClient } from '@release-hub/db'

export interface IDomainEvent {
  readonly eventName: string
  readonly occurredAt: Date
}

export type RepositoryMethod<TArgs extends unknown[], TReturn> =
  (...args: [...TArgs, tx: TxClient]) => Promise<TReturn>

export interface IBaseRepository<TEntity, TId = string> {
  findById(id: TId, tx: TxClient): Promise<TEntity | null>
}
