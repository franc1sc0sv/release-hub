import type { IFeature, IFeatureDetail, IFeaturePullRequest, IFeatureCommit, IFeatureTicketLink, IFeatureInRelease } from '../interfaces/feature.interfaces'
import { FeatureType } from './feature.type'
import { FeatureDetailType, FeatureReleaseSnapshotType } from './feature-detail.type'
import { FeatureInReleaseType } from './feature-in-release.type'
import { FlagStateType } from './flag-state.type'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { PullRequestType } from '../../release/types/pull-request.type'
import { CommitType } from '../../release/types/commit.type'
import { TicketLinkType } from '../../release/types/ticket-link.type'
import { toReleaseObjectType } from '../../release/types/release.mappers'
import { deriveClientAvailability } from './client-availability.map'

export function toFeatureType(feature: IFeature): FeatureType {
  const type = new FeatureType()
  type.id = feature.id
  type.projectId = feature.projectId
  type.name = feature.name
  type.description = feature.description
  type.kind = feature.kind as FeatureKind
  type.tags = feature.tags
  type.suggested = feature.suggested
  type.currentState = feature.state
  type.createdAt = feature.createdAt
  type.updatedAt = feature.updatedAt
  return type
}

function toTicketLinkType(ticket: IFeatureTicketLink): TicketLinkType {
  const type = new TicketLinkType()
  type.issueId = ticket.issueId
  type.source = ticket.source
  type.url = ticket.url
  type.title = ticket.title
  type.confidence = ticket.confidence
  return type
}

function toCommitType(commit: IFeatureCommit): CommitType {
  const type = new CommitType()
  type.sha = commit.sha
  type.message = commit.message
  type.author = commit.author
  type.date = commit.committedAt
  return type
}

function toFeaturePullRequestType(pr: IFeaturePullRequest): PullRequestType {
  const type = new PullRequestType()
  type.id = pr.id
  type.number = pr.number
  type.title = pr.title
  type.body = pr.body
  type.author = pr.author
  type.mergedAt = pr.mergedAt
  type.releaseId = pr.releaseId
  type.featureId = pr.featureId
  type.aiConfidence = pr.aiConfidence
  type.aiRationale = pr.aiRationale
  type.commits = pr.commits.map(toCommitType)
  type.tickets = pr.tickets.map(toTicketLinkType)
  return type
}

function toFeatureReleaseSnapshotType(fir: IFeatureInRelease): FeatureReleaseSnapshotType {
  const type = new FeatureReleaseSnapshotType()
  type.releaseId = fir.releaseId
  type.state = fir.state
  return type
}

export function toFeatureDetailType(detail: IFeatureDetail): FeatureDetailType {
  const type = new FeatureDetailType()
  type.feature = toFeatureType(detail.feature)
  type.releases = detail.releases.map(toReleaseObjectType)
  type.prs = detail.prs.map(toFeaturePullRequestType)
  type.snapshots = detail.snapshots.map(toFeatureReleaseSnapshotType)
  return type
}

export function toFeatureInReleaseType(fir: IFeatureInRelease): FeatureInReleaseType {
  const type = new FeatureInReleaseType()
  type.featureId = fir.featureId
  type.releaseId = fir.releaseId
  type.state = fir.state
  if (fir.flagState !== null) {
    const flagStateType = new FlagStateType()
    flagStateType.staging = fir.flagState.staging
    flagStateType.production = fir.flagState.production
    type.flagState = flagStateType
  } else {
    type.flagState = null
  }
  type.updatedAt = fir.updatedAt
  type.clientAvailabilityKey = deriveClientAvailability(fir.state, fir.flagState)
  return type
}
