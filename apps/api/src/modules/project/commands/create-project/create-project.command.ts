export class CreateProjectCommand {
  constructor(
    readonly userId: string,
    readonly organizationId: string,
    readonly name: string,
    readonly repo: string,
    readonly githubInstallationId?: string,
  ) {}
}
