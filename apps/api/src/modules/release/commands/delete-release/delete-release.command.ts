export class DeleteReleaseCommand {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
  ) {}
}
