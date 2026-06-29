import type { IFeatureCreatedEvent } from './feature.events'

export class FeatureCreatedEvent implements IFeatureCreatedEvent {
  readonly eventName = 'feature.created' as const
  readonly occurredAt: Date

  constructor(
    readonly featureId: string,
    readonly projectId: string,
  ) {
    this.occurredAt = new Date()
  }
}
