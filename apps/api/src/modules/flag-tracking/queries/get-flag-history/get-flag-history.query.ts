export class GetFlagHistoryQuery {
  constructor(
    readonly projectId: string,
    readonly flagKey: string,
    readonly userId: string,
    readonly limit: number,
    readonly offset: number,
  ) {}
}
