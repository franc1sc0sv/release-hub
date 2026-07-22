import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type { ReleaseStatus } from '../../../common/types/release-status.enum'
import type { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import type { AiSummaryStatus } from '../../../common/types/ai-summary-status.enum'
import type {
  IRelease,
  ICreateReleaseData,
  IUpdateReleaseData,
  IReleasesPageFilters,
  IReleasesPage,
} from './release.interfaces'

export abstract class IReleaseRepository implements IBaseRepository<IRelease> {
  abstract findById: RepositoryMethod<[id: string], IRelease | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IRelease[]>
  abstract findPageByProject: RepositoryMethod<[filters: IReleasesPageFilters], IReleasesPage>
  abstract create: RepositoryMethod<[data: ICreateReleaseData], IRelease>
  abstract update: RepositoryMethod<[id: string, data: IUpdateReleaseData], IRelease>
  abstract updateStatus: RepositoryMethod<[id: string, status: ReleaseStatus, prUrl: string | null], IRelease>
  abstract setStatus: RepositoryMethod<[id: string, status: ReleaseStatus], IRelease>
  abstract setDeployedStatus: RepositoryMethod<
    [id: string, status: ReleaseStatus, deployedAt: Date, githubDeploymentId: string | null],
    IRelease
  >
  abstract updateAiDraftStatus: RepositoryMethod<[id: string, status: AiDraftStatus], IRelease>
  abstract updateAiDraftStatusBulk: RepositoryMethod<[ids: string[], status: AiDraftStatus], void>
  abstract findIdsByAiDraftStatus: RepositoryMethod<[status: AiDraftStatus], string[]>
  abstract updateSummaryStatus: RepositoryMethod<[id: string, status: AiSummaryStatus], IRelease>
  abstract updateSummaryStatusBulk: RepositoryMethod<[ids: string[], status: AiSummaryStatus], void>
  abstract findIdsBySummaryStatus: RepositoryMethod<[status: AiSummaryStatus], string[]>
  abstract updateSummary: RepositoryMethod<
    [id: string, summary: string, summaryProfileId: string | null, summaryModel: string | null],
    IRelease
  >
  abstract softDelete: RepositoryMethod<[id: string], IRelease>
}
