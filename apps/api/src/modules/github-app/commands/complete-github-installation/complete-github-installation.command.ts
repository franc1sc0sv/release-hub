export class CompleteGithubInstallationCommand {
  constructor(
    readonly userId: string,
    readonly installationId: string,
    readonly state: string,
  ) {}
}
