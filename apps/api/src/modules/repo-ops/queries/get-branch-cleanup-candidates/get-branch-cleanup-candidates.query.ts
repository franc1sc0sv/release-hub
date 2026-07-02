export class GetBranchCleanupCandidatesQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
