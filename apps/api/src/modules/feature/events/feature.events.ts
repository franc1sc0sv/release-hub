import type { IDomainEvent } from '../../../common/cqrs/types'
import type { FeatureState } from '../../../common/types/feature-state.enum'

export interface IFeatureCreatedEvent extends IDomainEvent {
  readonly eventName: 'feature.created'
  readonly featureId: string
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IPrAssignedToFeatureEvent extends IDomainEvent {
  readonly eventName: 'feature.pr_assigned'
  readonly prId: string
  readonly featureId: string
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IFeatureStateChangedEvent extends IDomainEvent {
  readonly eventName: 'feature.state_changed'
  readonly featureId: string
  readonly state: FeatureState
  readonly occurredAt: Date
}

export interface IFeatureTagsChangedEvent extends IDomainEvent {
  readonly eventName: 'feature.tags_changed'
  readonly featureId: string
  readonly tags: string[]
  readonly occurredAt: Date
}
