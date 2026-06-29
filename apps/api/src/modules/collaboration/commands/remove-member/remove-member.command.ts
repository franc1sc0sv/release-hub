export class RemoveMemberCommand {
  constructor(
    readonly actorId: string,
    readonly membershipId: string,
  ) {}
}
