import { FeatureState } from '../../../common/types/feature-state.enum'

export function featureStateToClientLine(
  state: string,
  flagStaging: boolean | null,
  flagProduction: boolean | null,
): string {
  if (state === FeatureState.IN_PROGRESS) return 'in development, planned for an upcoming release'
  if (state === FeatureState.SHIPPED_FLAG_OFF) return 'built and ready; not yet switched on'
  if (state === FeatureState.READY_TO_RELEASE) return 'in final testing; rolling out shortly'
  if (state === FeatureState.FULLY_RELEASED) return 'available now'
  if (state === FeatureState.COMPLETED) return 'available now'
  if (state === FeatureState.PARTIAL) return 'first part available now; the rest is coming'
  if (state === FeatureState.BLOCKED) return 'delayed'

  if (flagStaging !== null && flagProduction !== null) {
    if (flagStaging && flagProduction) return 'available now'
    if (flagStaging && !flagProduction) return 'in final testing; rolling out shortly'
    return 'built and ready; not yet switched on'
  }

  return 'in development, planned for an upcoming release'
}
