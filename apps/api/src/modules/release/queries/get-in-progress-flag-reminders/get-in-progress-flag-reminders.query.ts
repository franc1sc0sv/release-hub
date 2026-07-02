export class GetInProgressFlagRemindersQuery {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly excludeReleaseId: string | null = null,
  ) {}
}
