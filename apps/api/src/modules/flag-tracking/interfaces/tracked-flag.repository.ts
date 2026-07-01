import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { ITrackedFlag, ICreateTrackedFlagData, ITrackedFlagWithDetails } from './flag-tracking.interfaces'

export abstract class ITrackedFlagRepository implements IBaseRepository<ITrackedFlag> {
  abstract findById: RepositoryMethod<[id: string], ITrackedFlag | null>
  abstract findByIdWithDetails: RepositoryMethod<[id: string], ITrackedFlagWithDetails | null>
  abstract findByProjectAndKey: RepositoryMethod<[projectId: string, key: string], ITrackedFlag | null>
  abstract findByProjectAndKeyWithDetails: RepositoryMethod<
    [projectId: string, key: string],
    ITrackedFlagWithDetails | null
  >
  abstract upsertByProjectAndKey: RepositoryMethod<[data: ICreateTrackedFlagData], ITrackedFlag>
  abstract setAddedInPullRequest: RepositoryMethod<
    [trackedFlagId: string, pullRequestId: string, featureId: string | null],
    void
  >
  abstract setRemovedInPullRequest: RepositoryMethod<[trackedFlagId: string, pullRequestId: string], void>
  abstract setPresentInCode: RepositoryMethod<[trackedFlagId: string, presentInCode: boolean], void>
  abstract findAllForProject: RepositoryMethod<[projectId: string], ITrackedFlagWithDetails[]>
}
