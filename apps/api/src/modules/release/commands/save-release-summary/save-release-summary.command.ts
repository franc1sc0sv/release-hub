export class SaveReleaseSummaryCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly summary: string,
  ) {}
}
