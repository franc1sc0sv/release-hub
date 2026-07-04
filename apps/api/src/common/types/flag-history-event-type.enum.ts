import { registerEnumType } from '@nestjs/graphql'

export const FlagHistoryEventType = {
  FLAG_CREATED: 'flag_created',
  FLAG_DELETED: 'flag_deleted',
  FLAG_ENABLED: 'flag_enabled',
  FLAG_DISABLED: 'flag_disabled',
  FLAG_VALUE_CHANGED: 'flag_value_changed',
  DECISION_ENABLE_IN_RELEASE: 'decision_enable_in_release',
  DECISION_SHIP_OFF: 'decision_ship_off',
  DECISION_IN_PROGRESS: 'decision_in_progress',
  CONFLICT_DETECTED: 'conflict_detected',
  REMINDER_SENT: 'reminder_sent',
  SYNC_COMPLETED: 'sync_completed',
  COVERAGE_SCAN: 'coverage_scan',
} as const

export type FlagHistoryEventType = (typeof FlagHistoryEventType)[keyof typeof FlagHistoryEventType]

registerEnumType(FlagHistoryEventType, { name: 'FlagHistoryEventType' })
