export class ListOrgMembersQuery {
  constructor(
    public readonly actorId: string,
    public readonly organizationId: string,
  ) {}
}
