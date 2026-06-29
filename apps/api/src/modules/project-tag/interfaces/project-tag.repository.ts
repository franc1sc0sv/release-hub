import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { IProjectTag, ICreateProjectTagData } from './project-tag.interfaces'

export abstract class IProjectTagRepository implements IBaseRepository<IProjectTag> {
  abstract findById: RepositoryMethod<[id: string], IProjectTag | null>
  abstract listByProject: RepositoryMethod<[projectId: string], IProjectTag[]>
  abstract create: RepositoryMethod<[data: ICreateProjectTagData], IProjectTag>
  abstract softDelete: RepositoryMethod<[id: string], void>
  abstract existsByNames: RepositoryMethod<[projectId: string, names: string[]], boolean>
}
