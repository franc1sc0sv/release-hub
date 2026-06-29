export interface IPrAssignment {
  pullRequestId: string
  featureId?: string
}

export class UpdateReleaseCommand {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly tags?: string[],
    readonly prAssignments?: IPrAssignment[],
  ) {}
}
