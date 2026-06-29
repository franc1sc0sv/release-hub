export class ListProjectTagsQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
