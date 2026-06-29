export class GeneratePrSummaryCommand {
  constructor(
    readonly prId: string,
    readonly userId: string,
  ) {}
}
