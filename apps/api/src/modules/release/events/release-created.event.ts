import type { IReleaseCreatedEvent } from './release.events'

export class ReleaseCreatedEvent implements IReleaseCreatedEvent {
  readonly eventName = 'release.created' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
  ) {
    this.occurredAt = new Date()
  }
}
