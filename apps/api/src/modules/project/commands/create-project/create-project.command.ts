import type { GithubAuthMode } from '@release-hub/db'

export class CreateProjectCommand {
  constructor(
    readonly userId: string,
    readonly organizationId: string,
    readonly name: string,
    readonly repo: string,
    readonly githubAuthMode?: GithubAuthMode,
    readonly githubInstallationId?: string,
  ) {}
}
