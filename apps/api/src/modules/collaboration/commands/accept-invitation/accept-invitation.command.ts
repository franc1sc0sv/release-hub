export class AcceptInvitationCommand {
  constructor(
    readonly actorId: string,
    readonly actorEmail: string,
    readonly token: string,
  ) {}
}
