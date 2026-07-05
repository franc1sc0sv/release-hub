import type { IRepoPushReceivedEvent } from './repo-ops.events'

export class RepoPushReceivedEvent implements IRepoPushReceivedEvent {
  readonly eventName = 'repo.push_received' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly ref: string,
    readonly beforeSha: string,
    readonly afterSha: string,
    readonly commitCount: number,
  ) {
    this.occurredAt = new Date()
  }
}
