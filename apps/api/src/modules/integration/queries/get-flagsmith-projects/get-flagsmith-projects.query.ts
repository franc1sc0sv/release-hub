export class GetFlagsmithProjectsQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly url: string,
    public readonly apiKey: string,
  ) {}
}
