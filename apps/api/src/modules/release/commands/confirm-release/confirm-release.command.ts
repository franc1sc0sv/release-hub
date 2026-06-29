export class ConfirmReleaseCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
