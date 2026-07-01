import type { IReleaseResyncedEvent } from './release.events'

export class ReleaseResyncedEvent implements IReleaseResyncedEvent {
  readonly eventName = 'release.resynced' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
    readonly newPrCount: number,
  ) {
    this.occurredAt = new Date()
  }
}
