import type { FlagsmithSyncSource } from '@release-hub/db'

export class SyncFlagsmithFlagsCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string | null,
    public readonly source: FlagsmithSyncSource,
  ) {}
}
