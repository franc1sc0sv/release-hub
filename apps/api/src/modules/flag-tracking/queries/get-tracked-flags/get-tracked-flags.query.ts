export class GetTrackedFlagsQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
