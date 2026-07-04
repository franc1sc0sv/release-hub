import type { IFlagWebhookTransitionEvent, FlagWebhookTransition } from './integration.events'

export class FlagWebhookTransitionEvent implements IFlagWebhookTransitionEvent {
  readonly eventName = 'flagsmith.flag.webhook-transition' as const
  readonly occurredAt: Date

  constructor(
    readonly projectId: string,
    readonly flagKey: string,
    readonly environmentName: string | null,
    readonly transition: FlagWebhookTransition,
    readonly previousValue: string | null = null,
    readonly newValue: string | null = null,
  ) {
    this.occurredAt = new Date()
  }
}
