export class BlockBranchCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly branchName: string,
    readonly reason: string | null,
  ) {}
}
