import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IRepoPushReceivedEvent extends IDomainEvent {
  readonly eventName: 'repo.push_received'
  readonly projectId: string
  readonly ref: string
  readonly beforeSha: string
  readonly afterSha: string
  readonly commitCount: number
  readonly occurredAt: Date
}

export interface IRepoRefChangedEvent extends IDomainEvent {
  readonly eventName: 'repo.ref_changed'
  readonly projectId: string
  readonly ref: string
  readonly refType: string
  readonly action: string
  readonly occurredAt: Date
}

export interface IRepoPullRequestEvent extends IDomainEvent {
  readonly eventName: 'repo.pull_request'
  readonly projectId: string
  readonly action: string
  readonly number: number
  readonly merged: boolean
  readonly occurredAt: Date
}
