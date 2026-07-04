import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type {
  IReleaseFlagDecision,
  ICreateReleaseFlagDecisionData,
  ILatestInProgressFlagDecision,
} from './flag-tracking.interfaces'

export interface IActiveEnableDecisionForFlag {
  trackedFlagId: string
  releaseId: string
  releaseName: string | null
}

export abstract class IReleaseFlagDecisionRepository implements IBaseRepository<IReleaseFlagDecision> {
  abstract findById: RepositoryMethod<[id: string], IReleaseFlagDecision | null>
  abstract findByReleaseAndFlag: RepositoryMethod<
    [releaseId: string, trackedFlagId: string],
    IReleaseFlagDecision | null
  >
  abstract findAllForRelease: RepositoryMethod<[releaseId: string], IReleaseFlagDecision[]>
  abstract findAllForTrackedFlag: RepositoryMethod<[trackedFlagId: string], IReleaseFlagDecision[]>
  abstract upsertByReleaseAndFlag: RepositoryMethod<[data: ICreateReleaseFlagDecisionData], IReleaseFlagDecision>
  abstract findLatestInProgressForProject: RepositoryMethod<
    [projectId: string, excludeReleaseId: string | null],
    ILatestInProgressFlagDecision[]
  >
  abstract findActiveEnableDecisionForFlag: RepositoryMethod<
    [projectId: string, key: string],
    IActiveEnableDecisionForFlag | null
  >
  abstract findLatestForTrackedFlag: RepositoryMethod<[trackedFlagId: string], IReleaseFlagDecision | null>
}
