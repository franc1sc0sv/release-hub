export class ReconcileGithubInstallationCommand {
  constructor(
    readonly installationId: number,
    readonly action: string,
  ) {}
}
