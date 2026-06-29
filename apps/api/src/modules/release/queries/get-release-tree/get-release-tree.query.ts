export class GetReleaseTreeQuery {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
