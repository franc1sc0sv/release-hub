export class CreateGithubBranchCommand {
  constructor(
    readonly userId: string,
    readonly projectId: string,
    readonly name: string,
    readonly fromRef: string,
  ) {}
}
