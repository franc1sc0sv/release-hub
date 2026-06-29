import { FeatureState } from '../../../common/types/feature-state.enum'
import type { IFlagState } from '../interfaces/feature.interfaces'

export const ClientAvailabilityKey = {
  IN_DEVELOPMENT: 'in_development',
  BUILT_NOT_ON: 'built_not_on',
  IN_FINAL_TESTING: 'in_final_testing',
  AVAILABLE_NOW: 'available_now',
  FIRST_PART_AVAILABLE: 'first_part_available',
  DELAYED: 'delayed',
  INTERNAL_ONLY: 'internal_only',
} as const

export type ClientAvailabilityKey = (typeof ClientAvailabilityKey)[keyof typeof ClientAvailabilityKey]

const stateToKey: Readonly<Record<FeatureState, ClientAvailabilityKey>> = Object.freeze({
  [FeatureState.IN_PROGRESS]: ClientAvailabilityKey.IN_DEVELOPMENT,
  [FeatureState.SHIPPED_FLAG_OFF]: ClientAvailabilityKey.BUILT_NOT_ON,
  [FeatureState.LIVE_STAGING]: ClientAvailabilityKey.IN_FINAL_TESTING,
  [FeatureState.LIVE_PROD]: ClientAvailabilityKey.AVAILABLE_NOW,
  [FeatureState.PARTIAL]: ClientAvailabilityKey.FIRST_PART_AVAILABLE,
  [FeatureState.FULLY_RELEASED]: ClientAvailabilityKey.AVAILABLE_NOW,
  [FeatureState.FLAG_CLEANUP_PENDING]: ClientAvailabilityKey.INTERNAL_ONLY,
  [FeatureState.BLOCKED]: ClientAvailabilityKey.DELAYED,
})

export function deriveClientAvailability(
  state: FeatureState,
  flagState: IFlagState | null,
): ClientAvailabilityKey {
  const key = stateToKey[state]
  if (key === ClientAvailabilityKey.AVAILABLE_NOW && flagState !== null && !flagState.production) {
    return ClientAvailabilityKey.IN_FINAL_TESTING
  }
  return key
}
