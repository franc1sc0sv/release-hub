import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IReleaseCreatedEvent extends IDomainEvent {
  readonly eventName: 'release.created'
  readonly releaseId: string
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IReleaseShippedEvent extends IDomainEvent {
  readonly eventName: 'release.shipped'
  readonly releaseId: string
  readonly projectId: string
  readonly prUrl: string
  readonly tag: string
  readonly occurredAt: Date
}
