import type { LinearSyncActionKind, LinearSyncActionStatus } from '@/generated/graphql'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'

export const LinearSyncActionKindValue = {
  MOVE_TO_PRODUCTION: 'MOVE_TO_PRODUCTION',
  FLAG_LABEL: 'FLAG_LABEL',
} as const satisfies Record<LinearSyncActionKind, LinearSyncActionKind>

export const LinearSyncActionStatusValue = {
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
  FAILED: 'FAILED',
} as const satisfies Record<LinearSyncActionStatus, LinearSyncActionStatus>

export const LINEAR_SYNC_STATUS_TONE: Record<LinearSyncActionStatus, StatusBadgeToneValue> = {
  DONE: StatusBadgeTone.EMERALD,
  SKIPPED: StatusBadgeTone.AMBER,
  FAILED: StatusBadgeTone.ROSE,
}

export const LINEAR_SYNC_KIND_ORDER: LinearSyncActionKind[] = [
  LinearSyncActionKindValue.MOVE_TO_PRODUCTION,
  LinearSyncActionKindValue.FLAG_LABEL,
]
