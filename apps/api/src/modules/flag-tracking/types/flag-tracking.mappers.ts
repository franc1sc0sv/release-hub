import { ReleaseStatus } from '../../../common/types/release-status.enum'
import { FlagReferenceKind } from '@release-hub/db'
import type {
  ITrackedFlagWithDetails,
  IFlagBranchPresence,
  IPullRequestFlagChangeWithPullRequest,
  IReleaseFlagDecision,
} from '../interfaces/flag-tracking.interfaces'
import type { IRelease } from '../../release/interfaces/release.interfaces'
import { TrackedFlagType, TrackedFlagFeatureType, FlagBranchPresenceType } from './tracked-flag.type'
import { ReleaseFlagType, ReleaseFlagChangeType } from './release-flag.type'
import {
  TrackedFlagDetailType,
  FlagBranchPresenceDetailType,
  TrackedFlagPullRequestChangeType,
  TrackedFlagReleaseType,
  TrackedFlagDeliveryType,
  TrackedFlagEventType,
} from './tracked-flag-detail.type'

function toFlagBranchPresenceType(presence: IFlagBranchPresence): FlagBranchPresenceType {
  const type = new FlagBranchPresenceType()
  type.branch = presence.branch
  type.present = presence.present
  type.lastConfirmedAt = presence.lastConfirmedAt
  return type
}

export function toTrackedFlagType(flag: ITrackedFlagWithDetails): TrackedFlagType {
  const type = new TrackedFlagType()
  type.id = flag.id
  type.key = flag.key
  type.presentInCode = flag.presentInCode
  if (flag.feature !== null) {
    const featureType = new TrackedFlagFeatureType()
    featureType.id = flag.feature.id
    featureType.name = flag.feature.name
    type.feature = featureType
  } else {
    type.feature = null
  }
  type.addedInPullRequestNumber = flag.addedInPullRequest?.number ?? null
  type.branchPresences = flag.branchPresence.map(toFlagBranchPresenceType)
  type.branchesPresentCount = flag.branchPresence.filter((bp) => bp.present).length
  return type
}

function toReleaseFlagChangeType(change: IPullRequestFlagChangeWithPullRequest): ReleaseFlagChangeType {
  const type = new ReleaseFlagChangeType()
  type.kind = change.kind
  type.action = change.action
  type.detectedFile = change.detectedFile
  type.prNumber = change.pullRequest.number
  type.prTitle = change.pullRequest.title
  type.prUrl = change.pullRequest.projectRepo
    ? `https://github.com/${change.pullRequest.projectRepo}/pull/${change.pullRequest.number}`
    : ''
  return type
}

export function toReleaseFlagType(
  flag: ITrackedFlagWithDetails,
  changes: IPullRequestFlagChangeWithPullRequest[],
  decision: IReleaseFlagDecision | null,
): ReleaseFlagType {
  const type = new ReleaseFlagType()
  type.id = flag.id
  type.key = flag.key
  if (flag.feature !== null) {
    const featureType = new TrackedFlagFeatureType()
    featureType.id = flag.feature.id
    featureType.name = flag.feature.name
    type.feature = featureType
  } else {
    type.feature = null
  }
  type.changes = changes.map(toReleaseFlagChangeType)
  type.decision = decision?.decision ?? null
  type.decidedAt = decision?.decidedAt ?? null
  return type
}

function toFlagBranchPresenceDetailType(presence: IFlagBranchPresence): FlagBranchPresenceDetailType {
  const type = new FlagBranchPresenceDetailType()
  type.branch = presence.branch
  type.present = presence.present
  type.firstSeenAt = presence.firstSeenAt
  type.lastConfirmedAt = presence.lastConfirmedAt
  return type
}

function toTrackedFlagPullRequestChangeType(
  change: IPullRequestFlagChangeWithPullRequest,
): TrackedFlagPullRequestChangeType {
  const type = new TrackedFlagPullRequestChangeType()
  type.prNumber = change.pullRequest.number
  type.prTitle = change.pullRequest.title
  type.prAuthor = change.pullRequest.author
  type.prMergedAt = change.pullRequest.mergedAt
  type.action = change.action
  type.kind = change.kind
  type.detectedFile = change.detectedFile
  return type
}

export function buildTrackedFlagDetailType(
  flag: ITrackedFlagWithDetails,
  changes: IPullRequestFlagChangeWithPullRequest[],
  releasesByPullRequestId: Map<string, IRelease>,
  decisionsByReleaseId: Map<string, IReleaseFlagDecision>,
): TrackedFlagDetailType {
  const type = new TrackedFlagDetailType()
  type.id = flag.id
  type.key = flag.key
  type.presentInCode = flag.presentInCode

  if (flag.feature !== null) {
    const featureType = new TrackedFlagFeatureType()
    featureType.id = flag.feature.id
    featureType.name = flag.feature.name
    type.feature = featureType
  } else {
    type.feature = null
  }

  type.branchPresences = flag.branchPresence.map(toFlagBranchPresenceDetailType)
  type.pullRequestChanges = changes.map(toTrackedFlagPullRequestChangeType)

  const releasesById = new Map<string, IRelease>()
  for (const change of changes) {
    const release = releasesByPullRequestId.get(change.pullRequestId)
    if (release) releasesById.set(release.id, release)
  }

  type.releases = [...releasesById.values()].map((release) => {
    const releaseType = new TrackedFlagReleaseType()
    releaseType.releaseId = release.id
    releaseType.version = release.name ?? release.compareRef
    releaseType.status = release.status
    releaseType.date = release.createdAt
    releaseType.decision = decisionsByReleaseId.get(release.id)?.decision ?? null
    return releaseType
  })

  const delivery = new TrackedFlagDeliveryType()
  delivery.inDefaultBranch = flag.presentInCode
  delivery.shippedReleaseVersions = [...releasesById.values()]
    .filter((release) => release.status === ReleaseStatus.DEPLOYED)
    .map((release) => release.name ?? release.compareRef)
  type.delivery = delivery

  const events: TrackedFlagEventType[] = []

  for (const change of changes) {
    const isDefinition = change.kind === FlagReferenceKind.DEFINITION
    const event = new TrackedFlagEventType()
    event.type = isDefinition ? 'detected_definition' : 'detected_usage'
    event.occurredAt = change.createdAt
    event.description = `${isDefinition ? 'Definition' : 'Usage'} detected in PR #${change.pullRequest.number} (${change.pullRequest.title})`
    events.push(event)
  }

  for (const presence of flag.branchPresence) {
    const event = new TrackedFlagEventType()
    event.type = 'first_seen_branch'
    event.occurredAt = presence.firstSeenAt
    event.description = `First seen on branch ${presence.branch}`
    events.push(event)
  }

  for (const release of releasesById.values()) {
    const decision = decisionsByReleaseId.get(release.id)
    if (!decision || !decision.decidedAt) continue
    const event = new TrackedFlagEventType()
    event.type = 'decision_made'
    event.occurredAt = decision.decidedAt
    event.description = `Decision "${decision.decision}" made for release ${release.name ?? release.compareRef}`
    events.push(event)
  }

  events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
  type.events = events

  return type
}
