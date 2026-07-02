import type { FlagAction, FlagReferenceKind, ReleaseFlagDecisionType } from '@release-hub/db'

export interface ITrackedFlag {
  id: string
  projectId: string
  key: string
  featureId: string | null
  addedInPullRequestId: string | null
  removedInPullRequestId: string | null
  presentInCode: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICreateTrackedFlagData {
  projectId: string
  key: string
  presentInCode: boolean
}

export interface IFlagBranchPresence {
  id: string
  trackedFlagId: string
  branch: string
  present: boolean
  headSha: string | null
  firstSeenAt: Date
  lastConfirmedAt: Date
}

export interface IPullRequestFlagChange {
  id: string
  pullRequestId: string
  trackedFlagId: string
  action: FlagAction
  kind: FlagReferenceKind
  detectedFile: string | null
  createdAt: Date
}

export interface ITrackedFlagWithDetails extends ITrackedFlag {
  feature: { id: string; name: string } | null
  addedInPullRequest: { id: string; number: number } | null
  branchPresence: IFlagBranchPresence[]
}

export interface IRunFlagCoveragePreparation {
  repo: string
  flagRegistryPath: string
  unionKeys: string[]
  defaultBranchKeys: string[]
  branchKeys: { branch: string; keys: string[] }[]
  prRegistryDiffs: { pullRequestId: string; featureId: string | null; added: string[]; removed: string[] }[]
}

export interface IPullRequestFlagChangeWithPullRequest extends IPullRequestFlagChange {
  flagKey: string
  pullRequest: {
    id: string
    number: number
    title: string
    author: string
    mergedAt: Date
    releaseId: string
    projectRepo: string
  }
}

export interface IReleaseFlagDecision {
  id: string
  releaseId: string
  trackedFlagId: string
  decision: ReleaseFlagDecisionType
  decidedById: string | null
  decidedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ICreateReleaseFlagDecisionData {
  releaseId: string
  trackedFlagId: string
  decision: ReleaseFlagDecisionType
  decidedById: string
  decidedAt: Date
}

export interface IScanReleasePullRequestsDetectedChange {
  pullRequestId: string
  key: string
  action: FlagAction
  kind: FlagReferenceKind
  detectedFile: string | null
  featureId: string | null
}

export interface IScanReleasePullRequestsPreparation {
  projectId: string
  pullRequestIds: string[]
  detectedChanges: IScanReleasePullRequestsDetectedChange[]
  prsScanned: number
}

export interface IPerFlagCoveragePreparation {
  projectId: string
  key: string
  repo: string
  flagRegistryPath: string
  presentInDefaultBranch: boolean
  branchKeys: { branch: string; present: boolean }[]
  prChanges: {
    pullRequestId: string
    featureId: string | null
    action: FlagAction
    kind: FlagReferenceKind
    detectedFile: string | null
  }[]
}

export interface ILatestInProgressFlagDecision {
  trackedFlagId: string
  key: string
  featureId: string | null
  releaseId: string
  decidedAt: Date | null
}
