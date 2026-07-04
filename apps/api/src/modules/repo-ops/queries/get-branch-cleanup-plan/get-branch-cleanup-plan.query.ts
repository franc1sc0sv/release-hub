export class GetBranchCleanupPlanQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
