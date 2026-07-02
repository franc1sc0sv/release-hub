import type { IFlagsmithConnectedEvent } from './integration.events'

export class FlagsmithConnectedEvent implements IFlagsmithConnectedEvent {
  readonly eventName = 'flagsmith.connected' as const
  readonly occurredAt: Date

  constructor(readonly projectId: string) {
    this.occurredAt = new Date()
  }
}
