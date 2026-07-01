export class GetTrackedFlagDetailQuery {
  constructor(
    readonly projectId: string,
    readonly key: string,
    readonly userId: string,
  ) {}
}
