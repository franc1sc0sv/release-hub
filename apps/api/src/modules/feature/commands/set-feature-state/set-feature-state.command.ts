import type { FeatureState } from '../../../../common/types/feature-state.enum'

export class SetFeatureStateCommand {
  constructor(
    readonly featureId: string,
    readonly state: FeatureState,
    readonly userId: string,
  ) {}
}
