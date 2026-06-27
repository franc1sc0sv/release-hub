import type { TxClient } from '@release-hub/db'

export abstract class IDatabaseService {
  abstract $transaction<T>(fn: (tx: TxClient) => Promise<T>): Promise<T>
}
