export class SetReleaseSourceRefCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly sourceRef: string,
  ) {}
}
