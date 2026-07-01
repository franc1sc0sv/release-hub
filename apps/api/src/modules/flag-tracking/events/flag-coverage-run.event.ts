import type { IFlagCoverageRunEvent } from './flag-tracking.events'

export class FlagCoverageRunEvent implements IFlagCoverageRunEvent {
  readonly eventName = 'flag-tracking.coverage-run' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly flagsTracked: number,
    readonly branchesScanned: number,
    readonly prChangesDetected: number,
  ) {
    this.occurredAt = new Date()
  }
}
