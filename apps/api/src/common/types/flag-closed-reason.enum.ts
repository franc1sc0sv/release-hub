import { registerEnumType } from '@nestjs/graphql'

export const FlagClosedReason = {
  FULLY_ROLLED_OUT: 'fully_rolled_out',
  ABANDONED: 'abandoned',
  REMOVED_FROM_CODE: 'removed_from_code',
} as const

export type FlagClosedReason = (typeof FlagClosedReason)[keyof typeof FlagClosedReason]

registerEnumType(FlagClosedReason, { name: 'FlagClosedReason' })
