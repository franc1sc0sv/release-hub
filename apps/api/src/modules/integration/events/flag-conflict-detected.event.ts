import type { IFlagConflictDetectedEvent } from './integration.events'

export class FlagConflictDetectedEvent implements IFlagConflictDetectedEvent {
  readonly eventName = 'flagsmith.flag.conflict-detected' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly flagKey: string,
    readonly environmentName: string,
    readonly releaseId: string,
    readonly releaseName: string | null,
  ) {
    this.occurredAt = new Date()
  }
}
