import type { IRepoPullRequestEvent } from './repo-ops.events'

export class RepoPullRequestEvent implements IRepoPullRequestEvent {
  readonly eventName = 'repo.pull_request' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly action: string,
    readonly number: number,
    readonly merged: boolean,
  ) {
    this.occurredAt = new Date()
  }
}
