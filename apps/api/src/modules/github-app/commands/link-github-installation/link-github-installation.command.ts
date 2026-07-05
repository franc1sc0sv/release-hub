export class LinkGithubInstallationCommand {
  constructor(
    readonly organizationId: string,
    readonly installationId: number,
    readonly projectId: string | null,
  ) {}
}
