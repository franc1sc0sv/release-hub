import { registerEnumType } from '@nestjs/graphql'

export const AiDraftStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  READY: 'ready',
  FAILED: 'failed',
} as const

export type AiDraftStatus = (typeof AiDraftStatus)[keyof typeof AiDraftStatus]

registerEnumType(AiDraftStatus, { name: 'AiDraftStatus' })
