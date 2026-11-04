import type { FlagClosedReason } from '../../../common/types/flag-closed-reason.enum'
import type { LinearSyncActionKind } from '../../../common/types/linear-sync-action-kind.enum'
import type { LinearSyncActionStatus } from '../../../common/types/linear-sync-action-status.enum'
import type { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'

export const LinearStateType = {
  TRIAGE: 'triage',
  BACKLOG: 'backlog',
  UNSTARTED: 'unstarted',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
} as const

export type LinearStateType = (typeof LinearStateType)[keyof typeof LinearStateType]

export const StatusMoveOutcome = {
  MOVE: 'move',
  ALREADY_THERE: 'already_there',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  ARCHIVED: 'archived',
  OPEN_PULL_REQUEST: 'open_pull_request',
  NOT_FOUND: 'not_found',
} as const

export type StatusMoveOutcome = (typeof StatusMoveOutcome)[keyof typeof StatusMoveOutcome]

export const FlagProductionState = {
  OFF: 'off',
  ON: 'on',
  PARTIAL: 'partial',
  ABANDONED: 'abandoned',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
} as const

export type FlagProductionState = (typeof FlagProductionState)[keyof typeof FlagProductionState]

export const LabelChange = {
  ADD: 'add',
  REMOVE: 'remove',
} as const

export type LabelChange = (typeof LabelChange)[keyof typeof LabelChange]

export interface ILinearWorkflowState {
  id: string
  name: string
  type: string
}

export interface ILinearIssueSnapshot {
  id: string
  identifier: string
  teamId: string
  state: ILinearWorkflowState
  labelIds: string[]
  archived: boolean
}

export interface IStatusMoveInput {
  issue: ILinearIssueSnapshot | null
  targetStateName: string
  openPullRequestNumber: number | null
}

export interface IStatusMoveDecision {
  outcome: StatusMoveOutcome
  detail: string
}

export interface IProductionFlagState {
  environmentName: string
  enabled: boolean
}

export interface IFlagSignalInput {
  closedReason: FlagClosedReason | null
  latestDecision: ReleaseFlagDecisionType | null
  productionStates: IProductionFlagState[]
}

export interface IFlagSignal {
  state: FlagProductionState
  enabledEnvironments: string[]
  closedReason: FlagClosedReason | null
}

export interface IFlagLabelPlan {
  labelChange: LabelChange
  signature: string
  comment: string
}

export interface IOpenPullRequestHead {
  headRef: string
  prNumber: number
}

export interface ILinearSyncAction {
  id: string
  projectId: string
  releaseId: string | null
  trackedFlagId: string | null
  issueIdentifier: string
  kind: LinearSyncActionKind
  status: LinearSyncActionStatus
  dedupeKey: string
  signature: string | null
  detail: string
  createdAt: Date
  updatedAt: Date
}

export interface IUpsertLinearSyncActionData {
  projectId: string
  releaseId: string | null
  trackedFlagId: string | null
  issueIdentifier: string
  kind: LinearSyncActionKind
  status: LinearSyncActionStatus
  dedupeKey: string
  signature: string | null
  detail: string
}

export interface ISyncPullRequest {
  id: string
  number: number
  featureId: string | null
  commitMessages: string[]
}

export interface ISyncRelease {
  id: string
  projectId: string
  displayName: string
  pullRequests: ISyncPullRequest[]
}

export interface ISyncFlag {
  id: string
  key: string
  closedReason: FlagClosedReason | null
  latestDecision: ReleaseFlagDecisionType | null
  productionStates: IProductionFlagState[]
  pullRequests: ISyncPullRequest[]
}

export interface ISyncProject {
  id: string
  repo: string
  linearEnabled: boolean
}

export interface ISyncSources {
  project: ISyncProject
  token: string
  release: ISyncRelease | null
  flags: ISyncFlag[]
}

export interface ISyncRun {
  projectId: string
  releaseId: string | null
  token: string
  teamKeys: ReadonlySet<string>
  openHeads: IOpenPullRequestHead[] | null
  issues: Map<string, ILinearIssueSnapshot | null>
  productionStates: Map<string, ILinearWorkflowState | null>
  labelIds: Map<string, string>
  records: IUpsertLinearSyncActionData[]
}
