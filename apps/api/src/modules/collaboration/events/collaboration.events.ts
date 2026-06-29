import type { IDomainEvent } from '../../../common/cqrs'

export interface IProjectInvitationSentEvent extends IDomainEvent {
  readonly to: string
  readonly inviterName: string
  readonly projectName: string
  readonly acceptToken: string
}
