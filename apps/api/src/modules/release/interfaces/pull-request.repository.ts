import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type {
  IPullRequest,
  ICreatePullRequestData,
  IReleasePullRequestsPageFilters,
  IPullRequestsPage,
} from './release.interfaces'

export interface IUpdatePrAiFields {
  featureId: string
  aiConfidence: number
  aiRationale: string
}

export abstract class IPullRequestRepository implements IBaseRepository<IPullRequest> {
  abstract findById: RepositoryMethod<[id: string], IPullRequest | null>
  abstract findAllByRelease: RepositoryMethod<[releaseId: string], IPullRequest[]>
  abstract findPageByRelease: RepositoryMethod<[filters: IReleasePullRequestsPageFilters], IPullRequestsPage>
  abstract upsert: RepositoryMethod<[data: ICreatePullRequestData], IPullRequest>
  abstract assignToFeature: RepositoryMethod<[prId: string, featureId: string], IPullRequest>
  abstract updateAiFields: RepositoryMethod<[prId: string, fields: IUpdatePrAiFields], IPullRequest>
  abstract updateSummary: RepositoryMethod<[prId: string, summary: string, summaryEditedAt: Date | null], IPullRequest>
  abstract clearFeatureAssignment: RepositoryMethod<[featureId: string], void>
  abstract clearReleaseAssignments: RepositoryMethod<[releaseId: string], void>
  abstract findPendingAdditionsByRelease: RepositoryMethod<[releaseId: string], IPullRequest[]>
  abstract clearPendingAddition: RepositoryMethod<[prId: string], IPullRequest>
}
