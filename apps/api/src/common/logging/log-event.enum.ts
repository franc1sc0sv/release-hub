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
} as const

export type LogEvent = (typeof LogEvent)[keyof typeof LogEvent]
