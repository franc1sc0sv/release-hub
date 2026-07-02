export class GetNotificationPreferencesQuery {
  constructor(
    readonly projectId: string,
    readonly userId: string,
  ) {}
}
