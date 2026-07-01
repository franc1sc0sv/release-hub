export class ConfirmReleaseAdditionsCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
