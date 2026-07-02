import { registerEnumType } from '@nestjs/graphql'

export const ReleaseFlagDecisionType = {
  ENABLE_IN_RELEASE: 'ENABLE_IN_RELEASE',
  SHIP_OFF: 'SHIP_OFF',
  IN_PROGRESS: 'in_progress',
} as const

export type ReleaseFlagDecisionType = (typeof ReleaseFlagDecisionType)[keyof typeof ReleaseFlagDecisionType]

registerEnumType(ReleaseFlagDecisionType, { name: 'ReleaseFlagDecisionType' })
