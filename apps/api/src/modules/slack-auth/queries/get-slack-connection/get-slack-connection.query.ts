export class GetSlackConnectionQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
