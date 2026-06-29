import type { RepositoryMethod, TxClient } from '../../../common/cqrs/types'

export interface IAiPullRequestContext {
  id: string
  number: number
  title: string
  body: string | null
  author: string
  branchName: string
  changedPaths: string[]
  commitMessages: string[]
  linkedTicketTitle: string | null
  tickets: Array<{ title: string; description: string | null }>
  releaseId: string
  projectId: string
}

export interface IAiFeatureContext {
  id: string
  name: string
  description: string
  kind: string
  state: string
  flagStaging: boolean | null
  flagProduction: boolean | null
  tags: string[]
  prSummaries: string[]
}

export interface IAiReleaseContext {
  id: string
  name: string
  compareRef: string
  projectId: string
  features: IAiFeatureContext[]
}

export abstract class IAiRepository {
  abstract findPullRequestContext: RepositoryMethod<[prId: string], IAiPullRequestContext | null>
  abstract findFeaturesForProject: RepositoryMethod<[projectId: string], IAiFeatureContext[]>
  abstract findReleaseContext: (
    releaseId: string,
    tx: TxClient,
    featureIds?: string[],
  ) => Promise<IAiReleaseContext | null>
}
