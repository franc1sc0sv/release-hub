export class RevokeInvitationCommand {
  constructor(
    readonly actorId: string,
    readonly invitationId: string,
  ) {}
}
