export class SavePrSummaryCommand {
  constructor(
    readonly prId: string,
    readonly summary: string,
    readonly userId: string,
  ) {}
}
