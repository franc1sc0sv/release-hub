import type { IDomainEvent } from '../../../common/cqrs/types'
import type { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'

export interface IReleaseCreatedEvent extends IDomainEvent {
  readonly eventName: 'release.created'
  readonly releaseId: string
  readonly projectId: string
  readonly actorId: string
  readonly occurredAt: Date
}

export interface IReleaseShippedEvent extends IDomainEvent {
  readonly eventName: 'release.shipped'
  readonly releaseId: string
  readonly projectId: string
  readonly prUrl: string | null
  readonly tag: string
  readonly occurredAt: Date
}

export interface IReleaseResyncedEvent extends IDomainEvent {
  readonly eventName: 'release.resynced'
  readonly releaseId: string
  readonly projectId: string
  readonly newPrCount: number
  readonly actorId: string
  readonly occurredAt: Date
}

export interface IReleaseDeployedEvent extends IDomainEvent {
  readonly eventName: 'release.deployed'
  readonly releaseId: string
  readonly projectId: string
  readonly occurredAt: Date
}

export interface IReleaseBranchUpdatedEvent extends IDomainEvent {
  readonly eventName: 'release.branch_updated'
  readonly releaseId: string
  readonly projectId: string
  readonly sourceRef: string
  readonly method: BranchUpdateMethod
  readonly commitsAdded: number
  readonly actorId: string
  readonly occurredAt: Date
}
