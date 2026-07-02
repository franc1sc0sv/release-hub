import type { ReleaseStatus } from '../../../../common/types/release-status.enum'

export class SystemSetReleaseStatusCommand {
  constructor(
    readonly releaseId: string,
    readonly status: ReleaseStatus,
    readonly githubDeploymentId: string | null = null,
  ) {}
}
