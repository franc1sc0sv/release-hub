export class ListBlockedBranchesQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
