import type { IFeatureStateChangedEvent } from './feature.events'
import type { FeatureState } from '../../../common/types/feature-state.enum'

export class FeatureStateChangedEvent implements IFeatureStateChangedEvent {
  readonly eventName = 'feature.state_changed' as const
  readonly occurredAt: Date

  constructor(
    readonly featureId: string,
    readonly state: FeatureState,
  ) {
    this.occurredAt = new Date()
  }
}
