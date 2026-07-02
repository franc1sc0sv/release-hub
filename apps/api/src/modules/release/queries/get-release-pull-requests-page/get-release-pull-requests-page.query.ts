export class GetReleasePullRequestsPageQuery {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly limit: number,
    readonly offset: number,
    readonly search: string | null,
  ) {}
}
