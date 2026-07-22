export const LogEvent = {
  OPERATION_SUCCESS: 'operation.success',
  OPERATION_ERROR: 'operation.error',
  SUBSCRIPTION_START: 'subscription.start',
  SUBSCRIPTION_ERROR: 'subscription.error',
  AI_DRAFT_STARTED: 'ai.draft.started',
  AI_DRAFT_PR_PROCESSED: 'ai.draft.pr.processed',
  AI_DRAFT_COMPLETED: 'ai.draft.completed',
  AI_DRAFT_FAILED: 'ai.draft.failed',
  AI_DRAFT_ORPHAN_SWEEP: 'ai.draft.orphan.sweep',
  AI_DRAFT_REGENERATE: 'ai.draft.regenerate',
  AI_SUMMARY_STARTED: 'ai.summary.started',
  AI_SUMMARY_COMPLETED: 'ai.summary.completed',
  AI_SUMMARY_FAILED: 'ai.summary.failed',
  AI_SUMMARY_ORPHAN_SWEEP: 'ai.summary.orphan.sweep',
  FLAGSMITH_SYNC_FAILED: 'flagsmith.sync.failed',
} as const

export type LogEvent = (typeof LogEvent)[keyof typeof LogEvent]
