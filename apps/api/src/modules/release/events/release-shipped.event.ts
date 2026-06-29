import type { IReleaseShippedEvent } from './release.events'

export class ReleaseShippedEvent implements IReleaseShippedEvent {
  readonly eventName = 'release.shipped' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
    readonly prUrl: string,
    readonly tag: string,
  ) {
    this.occurredAt = new Date()
  }
}
