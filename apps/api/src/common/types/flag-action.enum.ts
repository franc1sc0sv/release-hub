import { registerEnumType } from '@nestjs/graphql'

export const FlagAction = {
  ADDED: 'ADDED',
  MODIFIED: 'MODIFIED',
  REMOVED: 'REMOVED',
  UNCHANGED: 'UNCHANGED',
} as const

export type FlagAction = (typeof FlagAction)[keyof typeof FlagAction]

registerEnumType(FlagAction, { name: 'FlagAction' })
