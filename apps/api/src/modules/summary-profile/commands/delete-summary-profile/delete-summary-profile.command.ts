export class DeleteSummaryProfileCommand {
  constructor(
    readonly profileId: string,
    readonly userId: string,
  ) {}
}
