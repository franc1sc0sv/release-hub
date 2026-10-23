export class GetReleaseBranchStatusQuery {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
