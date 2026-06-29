export class ListGithubBranchesQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
