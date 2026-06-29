export const LogEvent = {
  OPERATION_SUCCESS: 'operation.success',
  OPERATION_ERROR: 'operation.error',
  SUBSCRIPTION_START: 'subscription.start',
  SUBSCRIPTION_ERROR: 'subscription.error',
} as const

export type LogEvent = (typeof LogEvent)[keyof typeof LogEvent]
