import type { FeatureKind } from '../../../common/types/feature-kind.enum'
import type { FeatureState } from '../../../common/types/feature-state.enum'
import type {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../common/types/feature-timeline.enum'
import type { TicketSource } from '../../../common/types/ticket-source.enum'
import type { IRelease } from '../../release/interfaces/release.interfaces'

export interface IFeature {
  id: string
  projectId: string
  name: string
  description: string
  kind: FeatureKind
  tags: string[]
  suggested: boolean
  state: FeatureState
  createdAt: Date
  updatedAt: Date
}

export interface IFeatureInRelease {
  id: string
  featureId: string
  releaseId: string
  state: FeatureState
  flagState: IFlagState | null
  updatedAt: Date
}

export interface IFlagState {
  staging: boolean
  production: boolean
}

export interface ICreateFeatureData {
  projectId: string
  name: string
  description: string
  createdById: string
  tags?: string[]
}

export interface IFeatureCommit {
  id: string
  pullRequestId: string
  sha: string
  message: string
  author: string
  committedAt: Date
}

export interface IFeatureTicketLink {
  issueId: string
  source: TicketSource
  url: string
  title: string
  confidence: number
}

export interface IFeaturePullRequest {
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
  commits: IFeatureCommit[]
  tickets: IFeatureTicketLink[]
}

export interface IFeatureDetail {
  feature: IFeature
  releases: IRelease[]
  prs: IFeaturePullRequest[]
  snapshots: IFeatureInRelease[]
  timeline: IFeatureStateEvent[]
}

export interface IMinimalPullRequest {
  id: string
  number: number
  title: string
  author: string
  mergedAt: Date
  releaseId: string
  featureId: string | null
}

export interface IFeaturesPageFilters {
  projectId: string
  limit: number
  offset: number
  search?: string
  assignableOnly?: boolean
}

export interface IFeatureStateEvent {
  id: string
  featureId: string
  releaseId: string | null
  scope: FeatureTimelineScope
  source: FeatureTimelineSource
  fromState: FeatureState | null
  toState: FeatureState
  actorId: string | null
  actorName: string | null
  releaseName: string | null
  flagKey: string | null
  occurredAt: Date
}

export interface ICreateFeatureStateEventData {
  featureId: string
  releaseId: string | null
  scope: FeatureTimelineScope
  source: FeatureTimelineSource
  fromState: FeatureState | null
  toState: FeatureState
  actorId: string | null
  flagKey: string | null
}

export interface IFeaturesPage {
  items: IFeature[]
  totalCount: number
  hasMore: boolean
}
