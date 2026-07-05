import type { TxClient } from '@release-hub/db'

export abstract class IGithubTokenResolver {
  abstract resolveForProject(
    projectId: string,
    userId: string | null,
    tx: TxClient,
  ): Promise<string>
}
