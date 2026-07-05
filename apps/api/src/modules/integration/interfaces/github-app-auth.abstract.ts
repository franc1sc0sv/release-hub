import type { IGithubRepository } from './github-client.interface'

export interface IGithubInstallationInfo {
  installationId: number
  accountLogin: string
  accountType: string
  accountId: number
  repositorySelection: string
}

export abstract class IGithubAppAuth {
  abstract getInstallationToken(installationId: number): Promise<string>
  abstract getInstallation(installationId: number): Promise<IGithubInstallationInfo>
  abstract listInstallationRepositories(installationId: number): Promise<IGithubRepository[]>
}
