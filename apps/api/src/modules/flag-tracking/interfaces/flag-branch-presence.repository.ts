import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { IFlagBranchPresence } from './flag-tracking.interfaces'

export interface IUpsertFlagBranchPresenceData {
  trackedFlagId: string
  branch: string
  present: boolean
  headSha: string | null
}

export interface IUpsertFlagBranchPresenceResult {
  presence: IFlagBranchPresence
  isNew: boolean
}

export abstract class IFlagBranchPresenceRepository implements IBaseRepository<IFlagBranchPresence> {
  abstract findById: RepositoryMethod<[id: string], IFlagBranchPresence | null>
  abstract upsertPresence: RepositoryMethod<[data: IUpsertFlagBranchPresenceData], IUpsertFlagBranchPresenceResult>
  abstract markAbsentForMissingBranches: RepositoryMethod<
    [trackedFlagId: string, presentBranches: string[]],
    void
  >
  abstract findAllForTrackedFlag: RepositoryMethod<[trackedFlagId: string], IFlagBranchPresence[]>
}
