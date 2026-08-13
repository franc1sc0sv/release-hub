export class ListFeaturesPageQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
    readonly limit: number,
    readonly offset: number,
    readonly search: string | undefined,
    readonly assignableOnly: boolean,
  ) {}
}
