export class StartSummaryGenerationCommand {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
    readonly model: string | null,
    readonly summaryProfileId: string | null,
    readonly featureIds: string[] | null,
  ) {}
}
