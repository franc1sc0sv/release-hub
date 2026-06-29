import { registerEnumType } from '@nestjs/graphql'

export const FlagSortField = {
  NAME: 'NAME',
  CREATED: 'CREATED',
  ENVIRONMENT: 'ENVIRONMENT',
} as const

export type FlagSortField = (typeof FlagSortField)[keyof typeof FlagSortField]

registerEnumType(FlagSortField, { name: 'FlagSortField' })
