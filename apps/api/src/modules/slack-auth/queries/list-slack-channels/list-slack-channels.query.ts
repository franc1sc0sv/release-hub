export class ListSlackChannelsQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
