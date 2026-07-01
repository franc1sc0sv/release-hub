import { registerEnumType } from '@nestjs/graphql'

export const FlagChangeAction = {
  added: 'added',
  modified: 'modified',
  removed: 'removed',
  unchanged: 'unchanged',
} as const

export type FlagChangeAction = (typeof FlagChangeAction)[keyof typeof FlagChangeAction]

registerEnumType(FlagChangeAction, { name: 'FlagChangeAction' })
