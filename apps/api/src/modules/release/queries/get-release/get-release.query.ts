export class GetReleaseQuery {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
