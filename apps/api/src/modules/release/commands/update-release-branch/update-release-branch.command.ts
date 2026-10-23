export class UpdateReleaseBranchCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
  ) {}
}
