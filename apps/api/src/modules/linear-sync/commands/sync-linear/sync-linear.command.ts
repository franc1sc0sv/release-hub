export class SyncLinearCommand {
  constructor(
    readonly projectId: string,
    readonly releaseId: string | null,
    readonly flagKey: string | null,
    readonly actorId: string | null,
  ) {}
}
