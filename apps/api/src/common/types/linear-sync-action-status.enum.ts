import { registerEnumType } from '@nestjs/graphql'

export const LinearSyncActionStatus = {
  DONE: 'done',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const

export type LinearSyncActionStatus = (typeof LinearSyncActionStatus)[keyof typeof LinearSyncActionStatus]

registerEnumType(LinearSyncActionStatus, { name: 'LinearSyncActionStatus' })
