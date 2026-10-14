import { FeatureState } from '../../../common/types/feature-state.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'

const decisionToFeatureState: Readonly<Record<ReleaseFlagDecisionType, FeatureState | null>> = Object.freeze({
  [ReleaseFlagDecisionType.ENABLE_IN_RELEASE]: FeatureState.READY_TO_RELEASE,
  [ReleaseFlagDecisionType.SHIP_OFF]: FeatureState.SHIPPED_FLAG_OFF,
  [ReleaseFlagDecisionType.IN_PROGRESS]: FeatureState.IN_PROGRESS,
  [ReleaseFlagDecisionType.ABANDONED]: null,
})

export function suggestFeatureStateForDecision(
  decision: ReleaseFlagDecisionType | null,
): FeatureState | null {
  if (decision === null) return null
  return decisionToFeatureState[decision]
}
