import type { FeatureTimelineScope, FeatureTimelineSource } from '@/generated/graphql'

export const FeatureTimelineScopeValue = {
  FEATURE: 'FEATURE',
  RELEASE: 'RELEASE',
} as const satisfies Record<FeatureTimelineScope, FeatureTimelineScope>

export const FeatureTimelineSourceValue = {
  USER: 'USER',
  FLAG_DECISION: 'FLAG_DECISION',
  SYSTEM: 'SYSTEM',
} as const satisfies Record<FeatureTimelineSource, FeatureTimelineSource>
