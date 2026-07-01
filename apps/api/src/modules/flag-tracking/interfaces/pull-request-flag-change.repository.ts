import type { FlagAction, FlagReferenceKind } from '@release-hub/db'
import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { IPullRequestFlagChange, IPullRequestFlagChangeWithPullRequest } from './flag-tracking.interfaces'

export interface ICreatePullRequestFlagChangeData {
  pullRequestId: string
  trackedFlagId: string
  action: FlagAction
  kind: FlagReferenceKind
  detectedFile: string | null
}

export abstract class IPullRequestFlagChangeRepository implements IBaseRepository<IPullRequestFlagChange> {
  abstract findById: RepositoryMethod<[id: string], IPullRequestFlagChange | null>
  abstract create: RepositoryMethod<[data: ICreatePullRequestFlagChangeData], IPullRequestFlagChange>
  abstract findExisting: RepositoryMethod<
    [pullRequestId: string, trackedFlagId: string, action: FlagAction, kind: FlagReferenceKind],
    IPullRequestFlagChange | null
  >
  abstract findAllForTrackedFlag: RepositoryMethod<
    [trackedFlagId: string],
    IPullRequestFlagChangeWithPullRequest[]
  >
  abstract findAllForPullRequestIds: RepositoryMethod<
    [pullRequestIds: string[]],
    IPullRequestFlagChangeWithPullRequest[]
  >
  abstract deleteForPullRequestIds: RepositoryMethod<[pullRequestIds: string[]], void>
}
