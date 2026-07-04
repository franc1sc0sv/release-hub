import type {
  FlagActivityFilter,
  FlagDeploymentStatus,
  FlagHistoryEventType,
  FlagHistorySource,
} from '@/generated/graphql'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'

export const FlagDeploymentStatusValue = {
  SHIPPED_ON: 'SHIPPED_ON',
  SHIPPED_OFF: 'SHIPPED_OFF',
  IN_PROGRESS: 'IN_PROGRESS',
  CONFLICT: 'CONFLICT',
  UNTRACKED: 'UNTRACKED',
} as const satisfies Record<FlagDeploymentStatus, FlagDeploymentStatus>

export const FLAG_DEPLOYMENT_STATUS_OPTIONS: FlagDeploymentStatus[] = [
  FlagDeploymentStatusValue.SHIPPED_ON,
  FlagDeploymentStatusValue.SHIPPED_OFF,
  FlagDeploymentStatusValue.IN_PROGRESS,
  FlagDeploymentStatusValue.CONFLICT,
  FlagDeploymentStatusValue.UNTRACKED,
]

const FLAG_DEPLOYMENT_STATUS_TONE: Record<FlagDeploymentStatus, StatusBadgeToneValue> = {
  SHIPPED_ON: StatusBadgeTone.EMERALD,
  SHIPPED_OFF: StatusBadgeTone.SLATE,
  IN_PROGRESS: StatusBadgeTone.AMBER,
  CONFLICT: StatusBadgeTone.ROSE,
  UNTRACKED: StatusBadgeTone.SLATE,
}

export function flagDeploymentStatusTone(status: FlagDeploymentStatus): StatusBadgeToneValue {
  return FLAG_DEPLOYMENT_STATUS_TONE[status]
}

export const FlagActivityFilterValue = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const satisfies Record<FlagActivityFilter, FlagActivityFilter>

export const FlagHistoryEventTypeValue = {
  FLAG_CREATED: 'FLAG_CREATED',
  FLAG_DELETED: 'FLAG_DELETED',
  FLAG_ENABLED: 'FLAG_ENABLED',
  FLAG_DISABLED: 'FLAG_DISABLED',
  FLAG_VALUE_CHANGED: 'FLAG_VALUE_CHANGED',
  DECISION_ENABLE_IN_RELEASE: 'DECISION_ENABLE_IN_RELEASE',
  DECISION_SHIP_OFF: 'DECISION_SHIP_OFF',
  DECISION_IN_PROGRESS: 'DECISION_IN_PROGRESS',
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  REMINDER_SENT: 'REMINDER_SENT',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  COVERAGE_SCAN: 'COVERAGE_SCAN',
} as const satisfies Record<FlagHistoryEventType, FlagHistoryEventType>

export const FlagHistorySourceValue = {
  WEBHOOK: 'WEBHOOK',
  SYNC: 'SYNC',
  USER: 'USER',
  SYSTEM: 'SYSTEM',
} as const satisfies Record<FlagHistorySource, FlagHistorySource>

const FLAG_HISTORY_SOURCE_TONE: Record<FlagHistorySource, StatusBadgeToneValue> = {
  WEBHOOK: StatusBadgeTone.INDIGO,
  SYNC: StatusBadgeTone.VIOLET,
  USER: StatusBadgeTone.EMERALD,
  SYSTEM: StatusBadgeTone.SLATE,
}

export function flagHistorySourceTone(source: FlagHistorySource): StatusBadgeToneValue {
  return FLAG_HISTORY_SOURCE_TONE[source]
}

export const FlagActivityFilterOption = {
  ALL: 'ALL',
  ACTIVE: FlagActivityFilterValue.ACTIVE,
  INACTIVE: FlagActivityFilterValue.INACTIVE,
} as const

export type FlagActivityFilterOptionValue =
  (typeof FlagActivityFilterOption)[keyof typeof FlagActivityFilterOption]
