import type { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'
import type { IReleaseBranchUpdatedEvent } from './release.events'

export class ReleaseBranchUpdatedEvent implements IReleaseBranchUpdatedEvent {
  readonly eventName = 'release.branch_updated' as const
  readonly occurredAt: Date

  constructor(
    readonly releaseId: string,
    readonly projectId: string,
    readonly sourceRef: string,
    readonly method: BranchUpdateMethod,
    readonly commitsAdded: number,
    readonly actorId: string,
  ) {
    this.occurredAt = new Date()
  }
}
