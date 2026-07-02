import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  IUpsertFlagsmithEnvironmentData,
  IUpsertFlagsmithFlagData,
  ICreateFlagsmithSyncRunData,
  IFlagsmithSyncRun,
  ICompleteFlagsmithSyncRunData,
  IFlagsmithFlagMatrixFilters,
  IFlagsmithFlagMatrixResult,
  IFlagsmithFlagRecord,
} from './flagsmith-sync.interfaces'

export abstract class IFlagsmithFlagRepository {
  abstract upsertEnvironment: RepositoryMethod<[data: IUpsertFlagsmithEnvironmentData], { id: string; name: string }>
  abstract upsertFlagWithStates: RepositoryMethod<[data: IUpsertFlagsmithFlagData], void>
  abstract reconcileFlags: RepositoryMethod<[projectId: string, flags: IUpsertFlagsmithFlagData[]], void>
  abstract softDeleteFlagsNotInKeys: RepositoryMethod<[projectId: string, keys: string[]], void>
  abstract softDeleteFlagByKey: RepositoryMethod<[projectId: string, key: string], void>
  abstract findFlagMatrix: RepositoryMethod<[filters: IFlagsmithFlagMatrixFilters], IFlagsmithFlagMatrixResult>
  abstract findAllFlagsForProject: RepositoryMethod<
    [projectId: string],
    { environments: string[]; flags: IFlagsmithFlagRecord[]; lastSyncedAt: Date | null }
  >
  abstract findLatestCompletedSyncRun: RepositoryMethod<[projectId: string], IFlagsmithSyncRun | null>
  abstract findEnabledStatesForKeys: RepositoryMethod<
    [projectId: string, keys: string[]],
    { key: string; environmentName: string; enabled: boolean }[]
  >
  abstract findFlagAndEnvironmentIds: RepositoryMethod<
    [projectId: string, key: string, environmentName: string],
    { flagId: string; environmentId: string } | null
  >
  abstract createSyncRun: RepositoryMethod<[data: ICreateFlagsmithSyncRunData], IFlagsmithSyncRun>
  abstract completeSyncRun: RepositoryMethod<[id: string, data: ICompleteFlagsmithSyncRunData], void>
  abstract failSyncRun: RepositoryMethod<[id: string, error: string], void>
}
