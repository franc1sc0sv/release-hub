import type { IReleasePullRequestsScannedEvent } from './flag-tracking.events'

export class ReleasePullRequestsScannedEvent implements IReleasePullRequestsScannedEvent {
  readonly eventName = 'flag-tracking.release-pull-requests-scanned' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
    readonly prsScanned: number,
    readonly changesRecorded: number,
  ) {
    this.occurredAt = new Date()
  }
}
