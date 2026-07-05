export class GetOrganizationQuery {
  constructor(
    public readonly actorId: string,
    public readonly organizationId: string,
  ) {}
}
