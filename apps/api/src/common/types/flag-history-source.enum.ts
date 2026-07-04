import { registerEnumType } from '@nestjs/graphql'

export const FlagHistorySource = {
  WEBHOOK: 'webhook',
  SYNC: 'sync',
  USER: 'user',
  SYSTEM: 'system',
} as const

export type FlagHistorySource = (typeof FlagHistorySource)[keyof typeof FlagHistorySource]

registerEnumType(FlagHistorySource, { name: 'FlagHistorySource' })
