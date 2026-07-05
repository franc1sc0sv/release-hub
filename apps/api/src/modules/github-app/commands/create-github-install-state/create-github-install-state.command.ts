export class CreateGithubInstallStateCommand {
  constructor(
    readonly actorId: string,
    readonly projectId: string | null,
    readonly organizationId: string | null,
  ) {}
}
