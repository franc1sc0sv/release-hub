import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IReleaseSummaryRequestedEvent extends IDomainEvent {
  readonly eventName: 'release.summary.requested'
  readonly releaseId: string
  readonly projectId: string
  readonly model: string | null
  readonly summaryProfileId: string | null
  readonly featureIds: string[] | null
  readonly occurredAt: Date
}
