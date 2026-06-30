import type { ReleaseStatus } from '../../../../common/types/release-status.enum'

export class SetReleaseStatusCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly status: ReleaseStatus,
  ) {}
}
