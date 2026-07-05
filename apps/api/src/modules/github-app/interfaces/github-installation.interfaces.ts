import type { GithubInstallationStatus } from '@release-hub/db'

export interface IGithubInstallation {
  id: string
  installationId: number
  organizationId: string | null
  accountLogin: string
  accountType: string
  accountId: number
  repositorySelection: string
  status: GithubInstallationStatus
}

export interface IUpsertGithubInstallationData {
  installationId: number
  organizationId: string | null
  accountLogin: string
  accountType: string
  accountId: number
  repositorySelection: string
  status: GithubInstallationStatus
}

export interface IInstallationRepoInput {
  repoId: number
  fullName: string
  private: boolean
}
