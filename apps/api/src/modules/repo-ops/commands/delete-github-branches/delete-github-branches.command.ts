export class DeleteGithubBranchesCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly branchNames: string[],
    readonly overriddenBranchNames: string[],
  ) {}
}
