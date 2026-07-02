export class SearchGithubBranchesQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly search: string | null,
    readonly limit: number,
  ) {}
}
