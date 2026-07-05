import type { IDomainEvent } from '../../../common/cqrs'

export interface IProjectInvitationSentEvent extends IDomainEvent {
  readonly to: string
  readonly inviterName: string
  readonly organizationName: string
  readonly acceptToken: string
}
