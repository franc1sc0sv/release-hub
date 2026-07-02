export class SyncGithubDeploymentsCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
