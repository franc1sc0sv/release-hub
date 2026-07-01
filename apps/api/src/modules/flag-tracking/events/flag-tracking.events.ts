import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IFlagCoverageRunEvent extends IDomainEvent {
  readonly eventName: 'flag-tracking.coverage-run'
  readonly projectId: string
  readonly flagsTracked: number
  readonly branchesScanned: number
  readonly prChangesDetected: number
  readonly occurredAt: Date
}

export interface IReleasePullRequestsScannedEvent extends IDomainEvent {
  readonly eventName: 'flag-tracking.release-pull-requests-scanned'
  readonly releaseId: string
  readonly projectId: string
  readonly prsScanned: number
  readonly changesRecorded: number
  readonly occurredAt: Date
}
