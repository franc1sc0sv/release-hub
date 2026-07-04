export class GetBranchAuthorsQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
