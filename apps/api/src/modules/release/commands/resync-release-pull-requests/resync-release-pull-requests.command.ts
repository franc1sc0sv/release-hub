export class ResyncReleasePullRequestsCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
