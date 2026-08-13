import type { FeatureState } from '../../../../common/types/feature-state.enum'

export class SetFeatureReleaseStateCommand {
  constructor(
    readonly featureId: string,
    readonly releaseId: string,
    readonly state: FeatureState,
    readonly userId: string,
    readonly flagKey: string | null,
  ) {}
}
