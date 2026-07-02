export class GetReleasesPageQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly limit: number,
    readonly offset: number,
    readonly search: string | null,
  ) {}
}
