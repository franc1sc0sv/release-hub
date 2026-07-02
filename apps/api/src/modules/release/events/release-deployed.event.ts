import type { IReleaseDeployedEvent } from './release.events'

export class ReleaseDeployedEvent implements IReleaseDeployedEvent {
  readonly eventName = 'release.deployed' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
  ) {
    this.occurredAt = new Date()
  }
}
