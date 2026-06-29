import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type {
  IProject,
  ICreateProjectData,
  IUpdateProjectData,
  IProjectMembershipRecord,
  IProjectConnectionCredentials,
  IProjectIntegrationSettings,
} from './project.interfaces'

export abstract class IProjectRepository implements IBaseRepository<IProject> {
  abstract findById: RepositoryMethod<[id: string], IProject | null>
  abstract findAllForUser: RepositoryMethod<[userId: string], IProject[]>
  abstract findAll: RepositoryMethod<[], IProject[]>
  abstract findMembershipsForUser: RepositoryMethod<[userId: string], IProjectMembershipRecord[]>
  abstract findCredentials: RepositoryMethod<[id: string], IProjectConnectionCredentials | null>
  abstract create: RepositoryMethod<[data: ICreateProjectData], IProject>
  abstract createDefaultFeatures: RepositoryMethod<[projectId: string], void>
  abstract update: RepositoryMethod<[id: string, data: IUpdateProjectData], IProject>
  abstract updateIntegrationSettings: RepositoryMethod<[id: string, data: IProjectIntegrationSettings], IProject>
  abstract delete: RepositoryMethod<[id: string], void>
}
