export class GenerateSummaryQuery {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
    readonly model: string | null,
    readonly tone: string | null,
    readonly featureIds: string[] | null,
  ) {}
}
