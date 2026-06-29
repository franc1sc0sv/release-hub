import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { ICommit, ICreateCommitData } from './release.interfaces'

export abstract class ICommitRepository implements IBaseRepository<ICommit> {
  abstract findById: RepositoryMethod<[id: string], ICommit | null>
  abstract upsert: RepositoryMethod<[data: ICreateCommitData], ICommit>
}
