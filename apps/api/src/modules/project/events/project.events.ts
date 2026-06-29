import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IProjectCreatedEvent extends IDomainEvent {
  readonly eventName: 'project.created'
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IProjectUpdatedEvent extends IDomainEvent {
  readonly eventName: 'project.updated'
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IProjectDeletedEvent extends IDomainEvent {
  readonly eventName: 'project.deleted'
  readonly projectId: string
  readonly occurredAt: Date
}
