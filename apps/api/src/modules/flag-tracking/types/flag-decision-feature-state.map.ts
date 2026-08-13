import { FeatureState } from '../../../common/types/feature-state.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'

const decisionToFeatureState: Readonly<Record<ReleaseFlagDecisionType, FeatureState>> = Object.freeze({
  [ReleaseFlagDecisionType.ENABLE_IN_RELEASE]: FeatureState.LIVE_PROD,
  [ReleaseFlagDecisionType.SHIP_OFF]: FeatureState.SHIPPED_FLAG_OFF,
  [ReleaseFlagDecisionType.IN_PROGRESS]: FeatureState.IN_PROGRESS,
})

export function suggestFeatureStateForDecision(
  decision: ReleaseFlagDecisionType | null,
): FeatureState | null {
  if (decision === null) return null
  return decisionToFeatureState[decision]
}
