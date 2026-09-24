export class ReopenTrackedFlagCommand {
  constructor(
    readonly projectId: string,
    readonly key: string,
    readonly userId: string,
  ) {}
}
