import type { IDomainEvent } from '../../../common/cqrs/types'

export interface IFlagsmithConnectedEvent extends IDomainEvent {
  readonly eventName: 'flagsmith.connected'
  readonly projectId: string
  readonly occurredAt: Date
}
