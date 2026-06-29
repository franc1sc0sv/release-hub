export interface IPullRequestInput {
  id: string
  branchName: string
  title: string
  body: string | null
  commitMessages: string[]
}

export class EnrichPrTicketsQuery {
  constructor(
    public readonly projectId: string,
    public readonly pullRequests: IPullRequestInput[],
    public readonly userId: string,
  ) {}
}
