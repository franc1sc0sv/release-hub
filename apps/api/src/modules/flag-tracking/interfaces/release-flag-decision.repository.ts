import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { IReleaseFlagDecision, ICreateReleaseFlagDecisionData } from './flag-tracking.interfaces'

export abstract class IReleaseFlagDecisionRepository implements IBaseRepository<IReleaseFlagDecision> {
  abstract findById: RepositoryMethod<[id: string], IReleaseFlagDecision | null>
  abstract findByReleaseAndFlag: RepositoryMethod<
    [releaseId: string, trackedFlagId: string],
    IReleaseFlagDecision | null
  >
  abstract findAllForRelease: RepositoryMethod<[releaseId: string], IReleaseFlagDecision[]>
  abstract upsertByReleaseAndFlag: RepositoryMethod<[data: ICreateReleaseFlagDecisionData], IReleaseFlagDecision>
}
