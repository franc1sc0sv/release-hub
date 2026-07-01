export class ScanReleasePullRequestsCommand {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
  ) {}
}
