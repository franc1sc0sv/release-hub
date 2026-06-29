import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type { ReleaseStatus } from '../../../common/types/release-status.enum'
import type { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import type { IRelease, ICreateReleaseData, IUpdateReleaseData } from './release.interfaces'

export abstract class IReleaseRepository implements IBaseRepository<IRelease> {
  abstract findById: RepositoryMethod<[id: string], IRelease | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IRelease[]>
  abstract create: RepositoryMethod<[data: ICreateReleaseData], IRelease>
  abstract update: RepositoryMethod<[id: string, data: IUpdateReleaseData], IRelease>
  abstract updateStatus: RepositoryMethod<[id: string, status: ReleaseStatus, prUrl: string], IRelease>
  abstract updateAiDraftStatus: RepositoryMethod<[id: string, status: AiDraftStatus], IRelease>
  abstract updateSummary: RepositoryMethod<[id: string, summary: string], IRelease>
  abstract softDelete: RepositoryMethod<[id: string], IRelease>
}
