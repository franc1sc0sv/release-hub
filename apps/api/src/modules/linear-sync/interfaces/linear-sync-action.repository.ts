import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { ILinearSyncAction, IUpsertLinearSyncActionData } from './linear-sync.interfaces'

export abstract class ILinearSyncActionRepository {
  abstract findByDedupeKey: RepositoryMethod<[projectId: string, dedupeKey: string], ILinearSyncAction | null>
  abstract findAllForRelease: RepositoryMethod<[releaseId: string], ILinearSyncAction[]>
  abstract upsert: RepositoryMethod<[data: IUpsertLinearSyncActionData], ILinearSyncAction>
}
