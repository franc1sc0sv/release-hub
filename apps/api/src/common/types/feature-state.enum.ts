import { registerEnumType } from '@nestjs/graphql'

export const FeatureState = {
  IN_PROGRESS: 'in_progress',
  SHIPPED_FLAG_OFF: 'shipped_flag_off',
  LIVE_STAGING: 'live_staging',
  LIVE_PROD: 'live_prod',
  PARTIAL: 'partial',
  FULLY_RELEASED: 'fully_released',
  FLAG_CLEANUP_PENDING: 'flag_cleanup_pending',
  BLOCKED: 'blocked',
} as const

export type FeatureState = (typeof FeatureState)[keyof typeof FeatureState]

registerEnumType(FeatureState, { name: 'FeatureState' })
