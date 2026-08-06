import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'

const UNRELEASED_STATES = new Set<FeatureState>([
  FeatureState.IN_PROGRESS,
  FeatureState.SHIPPED_FLAG_OFF,
  FeatureState.BLOCKED,
])

export const isExcludedFromSummary = (kind: FeatureKind, state: FeatureState): boolean =>
  kind === FeatureKind.PRODUCT && UNRELEASED_STATES.has(state)
