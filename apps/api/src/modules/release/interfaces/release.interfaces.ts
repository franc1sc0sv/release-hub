import type { ReleaseStatus } from '../../../common/types/release-status.enum'
import type { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import type { TicketSource } from '../../../common/types/ticket-source.enum'
import type { IGitHubCommit } from '../../integration/interfaces/github-client.interface'

export interface ICommit {
  id: string
  pullRequestId: string
  sha: string
  message: string
  author: string
  committedAt: Date
}

export interface ITicketLink {
  id: string
  pullRequestId: string
  issueId: string
  source: TicketSource
  url: string
  title: string
  description: string | null
  confidence: number
}

export interface IPullRequest {
  id: string
  number: number
  title: string
  body: string | null
  author: string
  mergedAt: Date
  releaseId: string
  featureId: string | null
  aiConfidence: number | null
  aiRationale: string | null
  summary: string | null
  summaryEditedAt: Date | null
  commits: ICommit[]
  ticketLinks: ITicketLink[]
}

export interface ICreatePullRequestData {
  number: number
  title: string
  body: string | null
  author: string
  mergedAt: Date
  releaseId: string
}

export interface ICreateCommitData {
  pullRequestId: string
  sha: string
  message: string
  author: string
  committedAt: Date
}

export interface IRelease {
  id: string
  projectId: string
  name: string | null
  baseRef: string
  compareRef: string
  status: ReleaseStatus
  aiDraftStatus: AiDraftStatus
  prUrl: string | null
  tags: string[]
  summary: string | null
  summaryEditedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ICreateReleaseData {
  projectId: string
  name: string
  baseRef: string
  compareRef: string
  tags: string[]
  createdById: string
}

export interface IUpdateReleaseData {
  tags?: string[]
}

export interface ICoverage {
  total: number
  assigned: number
  ready: boolean
}

export interface IPreparedTicketLink {
  issueId: string
  url: string
  title: string
  description: string
  source: TicketSource
  confidence: number
}

export interface IPreparedPullRequest {
  number: number
  title: string
  body: string | null
  author: string
  mergedAt: Date
  commits: IGitHubCommit[]
  ticketLinks: IPreparedTicketLink[]
}

export interface ICreateReleasePreparation {
  pullRequests: IPreparedPullRequest[]
}

export interface IConfirmReleasePreparation {
  releaseName: string
  prUrl: string
  suggestedFeatureIds: string[]
  assignedFeatureIds: string[]
}
