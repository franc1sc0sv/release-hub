import type { GithubAuthMode } from '@release-hub/db'
import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type {
  IProject,
  ICreateProjectData,
  IUpdateProjectData,
  IProjectConnectionCredentials,
  IProjectIntegrationSettings,
  IFlagRegistryConfig,
  IUpdateFlagRegistryData,
  IFlagRegistryConfigResult,
  IProjectWebhookSecretStatus,
} from './project.interfaces'

export abstract class IProjectRepository implements IBaseRepository<IProject> {
  abstract findById: RepositoryMethod<[id: string], IProject | null>
  abstract findAllForUser: RepositoryMethod<[userId: string], IProject[]>
  abstract findAll: RepositoryMethod<[], IProject[]>
  abstract findCredentials: RepositoryMethod<[id: string], IProjectConnectionCredentials | null>
  abstract create: RepositoryMethod<[data: ICreateProjectData], IProject>
  abstract createDefaultFeatures: RepositoryMethod<[projectId: string], void>
  abstract update: RepositoryMethod<[id: string, data: IUpdateProjectData], IProject>
  abstract updateIntegrationSettings: RepositoryMethod<[id: string, data: IProjectIntegrationSettings], IProject>
  abstract setInstallationMode: RepositoryMethod<[id: string, mode: GithubAuthMode, installationId: string], void>
  abstract delete: RepositoryMethod<[id: string], void>
  abstract findFlagRegistryConfig: RepositoryMethod<[id: string], IFlagRegistryConfig | null>
  abstract updateFlagRegistry: RepositoryMethod<[id: string, data: IUpdateFlagRegistryData], IFlagRegistryConfigResult>
  abstract findWebhookSecretStatus: RepositoryMethod<[id: string], IProjectWebhookSecretStatus | null>
  abstract regenerateFlagsmithWebhookSecret: RepositoryMethod<[id: string, secret: string], void>
  abstract regenerateGithubWebhookSecret: RepositoryMethod<[id: string, secret: string], void>
}
