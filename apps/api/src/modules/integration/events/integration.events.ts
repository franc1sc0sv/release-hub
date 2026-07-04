import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IFlagsmithConnectedEvent extends IDomainEvent {
  readonly eventName: 'flagsmith.connected'
  readonly projectId: string
  readonly occurredAt: Date
}

export const FlagWebhookTransition = {
  CREATED: 'created',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  DELETED: 'deleted',
  VALUE_CHANGED: 'value_changed',
} as const

export type FlagWebhookTransition = (typeof FlagWebhookTransition)[keyof typeof FlagWebhookTransition]

export interface IFlagWebhookTransitionEvent extends IDomainEvent {
  readonly eventName: 'flagsmith.flag.webhook-transition'
  readonly projectId: string
  readonly flagKey: string
  readonly environmentName: string | null
  readonly transition: FlagWebhookTransition
  readonly previousValue: string | null
  readonly newValue: string | null
  readonly occurredAt: Date
}

export interface IFlagConflictDetectedEvent extends IDomainEvent {
  readonly eventName: 'flagsmith.flag.conflict-detected'
  readonly projectId: string
  readonly flagKey: string
  readonly environmentName: string
  readonly releaseId: string
  readonly releaseName: string | null
  readonly occurredAt: Date
}
