import type { IPrAssignedToFeatureEvent } from './feature.events'

export class PrAssignedToFeatureEvent implements IPrAssignedToFeatureEvent {
  readonly eventName = 'feature.pr_assigned' as const
  readonly occurredAt: Date

  constructor(
    readonly prId: string,
    readonly featureId: string,
    readonly projectId: string,
  ) {
    this.occurredAt = new Date()
  }
}
