export class GetInstallationRepositoriesQuery {
  constructor(
    public readonly actorId: string,
    public readonly organizationId: string,
  ) {}
}
