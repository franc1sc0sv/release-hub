import type { IFeatureTagsChangedEvent } from './feature.events'

export class FeatureTagsChangedEvent implements IFeatureTagsChangedEvent {
  readonly eventName = 'feature.tags_changed' as const
  readonly occurredAt: Date

  constructor(
    readonly featureId: string,
    readonly tags: string[],
  ) {
    this.occurredAt = new Date()
  }
}
