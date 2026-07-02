import type {
  AiDraftStatus,
  FlagChangeAction,
  ReleaseFlagDecisionType,
  ReleaseStatus,
} from '@/generated/graphql'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'

export const ReleaseStatusValue = {
  DRAFT: 'DRAFT',
  READY_TO_RELEASE: 'READY_TO_RELEASE',
  MERGED: 'MERGED',
  DEPLOYED: 'DEPLOYED',
  CANCELED: 'CANCELED',
} as const satisfies Record<ReleaseStatus, ReleaseStatus>

export const RELEASE_STATUS_OPTIONS: ReleaseStatus[] = [
  ReleaseStatusValue.DRAFT,
  ReleaseStatusValue.READY_TO_RELEASE,
  ReleaseStatusValue.MERGED,
  ReleaseStatusValue.DEPLOYED,
  ReleaseStatusValue.CANCELED,
]

export const RELEASE_STATUS_TEXT_CLASS: Record<ReleaseStatus, string> = {
  DRAFT: 'text-slate-300',
  READY_TO_RELEASE: 'text-indigo-300',
  MERGED: 'text-violet-300',
  DEPLOYED: 'text-emerald-300',
  CANCELED: 'text-rose-300',
}

export const RELEASE_STATUS_BADGE_CLASS: Record<ReleaseStatus, string> = {
  DRAFT: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  READY_TO_RELEASE: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  MERGED: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  DEPLOYED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  CANCELED: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
}

const RELEASE_STATUS_TONE: Record<ReleaseStatus, StatusBadgeToneValue> = {
  DRAFT: StatusBadgeTone.SLATE,
  READY_TO_RELEASE: StatusBadgeTone.INDIGO,
  MERGED: StatusBadgeTone.VIOLET,
  DEPLOYED: StatusBadgeTone.EMERALD,
  CANCELED: StatusBadgeTone.ROSE,
}

export function releaseStatusTone(status: ReleaseStatus): StatusBadgeToneValue {
  return RELEASE_STATUS_TONE[status]
}

export const AiDraftStatusValue = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<AiDraftStatus, AiDraftStatus>

export const ReleaseFlagDecisionTypeValue = {
  ENABLE_IN_RELEASE: 'ENABLE_IN_RELEASE',
  SHIP_OFF: 'SHIP_OFF',
  IN_PROGRESS: 'IN_PROGRESS',
} as const satisfies Record<ReleaseFlagDecisionType, ReleaseFlagDecisionType>

export const RELEASE_FLAG_DECISION_OPTIONS: ReleaseFlagDecisionType[] = [
  ReleaseFlagDecisionTypeValue.ENABLE_IN_RELEASE,
  ReleaseFlagDecisionTypeValue.SHIP_OFF,
  ReleaseFlagDecisionTypeValue.IN_PROGRESS,
]

export const FlagChangeActionValue = {
  added: 'added',
  modified: 'modified',
  removed: 'removed',
  unchanged: 'unchanged',
} as const satisfies Record<FlagChangeAction, FlagChangeAction>
