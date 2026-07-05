export class DeleteOrganizationCommand {
  constructor(
    public readonly actorId: string,
    public readonly organizationId: string,
  ) {}
}
