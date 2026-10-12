export class ClearReleaseFlagDecisionCommand {
  constructor(
    readonly releaseId: string,
    readonly trackedFlagId: string,
    readonly userId: string,
  ) {}
}
