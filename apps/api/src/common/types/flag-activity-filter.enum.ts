import { registerEnumType } from '@nestjs/graphql'

export const FlagActivityFilter = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type FlagActivityFilter = (typeof FlagActivityFilter)[keyof typeof FlagActivityFilter]

registerEnumType(FlagActivityFilter, { name: 'FlagActivityFilter' })
