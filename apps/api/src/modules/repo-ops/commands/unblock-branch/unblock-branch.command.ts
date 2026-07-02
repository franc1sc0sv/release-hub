export class UnblockBranchCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly branchName: string,
  ) {}
}
