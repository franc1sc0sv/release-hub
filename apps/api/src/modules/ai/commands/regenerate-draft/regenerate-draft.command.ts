export class RegenerateDraftCommand {
  constructor(
    readonly releaseId: string,
    readonly userId: string,
    readonly resume: boolean,
  ) {}
}
