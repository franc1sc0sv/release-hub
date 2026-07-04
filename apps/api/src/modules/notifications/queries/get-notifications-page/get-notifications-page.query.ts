export class GetNotificationsPageQuery {
  constructor(
    readonly userId: string,
    readonly limit: number,
    readonly offset: number,
    readonly projectId: string | undefined,
  ) {}
}
