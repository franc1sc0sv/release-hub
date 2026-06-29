export class CompareRefsQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly baseRef: string,
    readonly compareRef: string,
  ) {}
}
