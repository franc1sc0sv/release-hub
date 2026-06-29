export class GetReleasesQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
  ) {}
}
