import type { IReleaseSummaryRequestedEvent } from './ai.events'

export class ReleaseSummaryRequestedEvent implements IReleaseSummaryRequestedEvent {
  readonly eventName = 'release.summary.requested' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
    readonly model: string | null,
    readonly summaryProfileId: string | null,
    readonly featureIds: string[] | null,
  ) {
    this.occurredAt = new Date()
  }
}
