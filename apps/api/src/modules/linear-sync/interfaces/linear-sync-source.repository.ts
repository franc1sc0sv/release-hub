import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { ISyncFlag, ISyncProject, ISyncRelease } from './linear-sync.interfaces'

export abstract class ILinearSyncSourceRepository {
  abstract findProject: RepositoryMethod<[projectId: string], ISyncProject | null>
  abstract findDeployedRelease: RepositoryMethod<[releaseId: string], ISyncRelease | null>
  abstract findFlagsForRelease: RepositoryMethod<[releaseId: string], ISyncFlag[]>
  abstract findFlagByKey: RepositoryMethod<[projectId: string, flagKey: string], ISyncFlag | null>
}
