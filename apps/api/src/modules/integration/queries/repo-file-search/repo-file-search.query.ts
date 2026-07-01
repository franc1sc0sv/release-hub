export class RepoFileSearchQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly query: string,
    public readonly branch?: string,
    public readonly limit: number = 50,
  ) {}
}
