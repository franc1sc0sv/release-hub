export class GetReleaseFlagsQuery {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
  ) {}
}
