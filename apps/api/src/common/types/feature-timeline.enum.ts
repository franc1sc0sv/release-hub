import { registerEnumType } from '@nestjs/graphql'

export const FeatureTimelineScope = {
  FEATURE: 'feature',
  RELEASE: 'release',
} as const

export type FeatureTimelineScope = (typeof FeatureTimelineScope)[keyof typeof FeatureTimelineScope]

registerEnumType(FeatureTimelineScope, { name: 'FeatureTimelineScope' })

export const FeatureTimelineSource = {
  USER: 'user',
  FLAG_DECISION: 'flag_decision',
  SYSTEM: 'system',
} as const

export type FeatureTimelineSource = (typeof FeatureTimelineSource)[keyof typeof FeatureTimelineSource]

registerEnumType(FeatureTimelineSource, { name: 'FeatureTimelineSource' })
