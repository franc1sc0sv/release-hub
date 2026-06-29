import { registerEnumType } from '@nestjs/graphql'

export const SortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection]

registerEnumType(SortDirection, { name: 'SortDirection' })
