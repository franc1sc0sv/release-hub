import type { FlagClosedReason } from '../../../../common/types/flag-closed-reason.enum'

export class CloseTrackedFlagCommand {
  constructor(
    readonly projectId: string,
    readonly key: string,
    readonly reason: FlagClosedReason,
    readonly userId: string,
  ) {}
}
