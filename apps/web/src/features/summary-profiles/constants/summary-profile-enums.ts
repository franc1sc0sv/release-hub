import type { SummaryExampleKind } from '@/generated/graphql'

export const SummaryExampleKindValue = {
  GOOD: 'GOOD',
  BAD: 'BAD',
} as const satisfies Record<SummaryExampleKind, SummaryExampleKind>
