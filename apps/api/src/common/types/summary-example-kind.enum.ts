import { registerEnumType } from '@nestjs/graphql'

export const SummaryExampleKind = {
  GOOD: 'good',
  BAD: 'bad',
} as const

export type SummaryExampleKind = (typeof SummaryExampleKind)[keyof typeof SummaryExampleKind]

registerEnumType(SummaryExampleKind, { name: 'SummaryExampleKind' })
