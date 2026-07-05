import type { IRepoRefChangedEvent } from './repo-ops.events'

export class RepoRefChangedEvent implements IRepoRefChangedEvent {
  readonly eventName = 'repo.ref_changed' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly ref: string,
    readonly refType: string,
    readonly action: string,
  ) {
    this.occurredAt = new Date()
  }
}
