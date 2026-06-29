import type { IProjectInvitationSentEvent } from './collaboration.events'

export class ProjectInvitationSentEvent implements IProjectInvitationSentEvent {
  readonly eventName = 'collaboration.invitation.sent' as const
  readonly occurredAt = new Date()

  constructor(
    readonly to: string,
    readonly inviterName: string,
    readonly projectName: string,
    readonly acceptToken: string,
  ) {}
}
