export class UpdateOrganizationCommand {
  constructor(
    public readonly actorId: string,
    public readonly organizationId: string,
    public readonly name: string,
  ) {}
}
