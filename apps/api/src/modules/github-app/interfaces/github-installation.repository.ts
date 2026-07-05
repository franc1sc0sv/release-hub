import type { GithubInstallationStatus } from '@release-hub/db'
import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  IGithubInstallation,
  IUpsertGithubInstallationData,
  IInstallationRepoInput,
} from './github-installation.interfaces'

export abstract class IGithubInstallationRepository {
  abstract upsertByInstallationId: RepositoryMethod<[data: IUpsertGithubInstallationData], { id: string }>
  abstract findByInstallationId: RepositoryMethod<[installationId: number], IGithubInstallation | null>
  abstract findActiveByOrganizationId: RepositoryMethod<[organizationId: string], IGithubInstallation | null>
  abstract linkOrganization: RepositoryMethod<[installationId: number, organizationId: string], void>
  abstract setStatus: RepositoryMethod<[installationId: number, status: GithubInstallationStatus], void>
  abstract replaceRepositories: RepositoryMethod<[installationRowId: string, repos: IInstallationRepoInput[]], void>
}
