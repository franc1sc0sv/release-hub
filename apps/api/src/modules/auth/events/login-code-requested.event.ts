import type { IDomainEvent } from '../../../common/cqrs'

export interface ILoginCodeRequestedEvent extends IDomainEvent {
  readonly userId: string
  readonly email: string
  readonly code: string
  readonly userName: string
}

export class LoginCodeRequestedEvent implements ILoginCodeRequestedEvent {
  readonly eventName = 'auth.login-code.requested' as const
  readonly occurredAt = new Date()

  constructor(
    readonly userId: string,
    readonly email: string,
    readonly code: string,
    readonly userName: string,
  ) {}
}
