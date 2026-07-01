import type { ReleaseFlagDecisionType } from '../../../../common/types/release-flag-decision-type.enum'

export class SetReleaseFlagDecisionCommand {
  constructor(
    readonly releaseId: string,
    readonly trackedFlagId: string,
    readonly decision: ReleaseFlagDecisionType,
    readonly userId: string,
  ) {}
}
