import { registerEnumType } from '@nestjs/graphql'

export const FeatureState = {
  IN_PROGRESS: 'in_progress',
  SHIPPED_FLAG_OFF: 'shipped_flag_off',
  READY_TO_RELEASE: 'ready_to_release',
  PARTIAL: 'partial',
  FULLY_RELEASED: 'fully_released',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
} as const

export type FeatureState = (typeof FeatureState)[keyof typeof FeatureState]

registerEnumType(FeatureState, { name: 'FeatureState' })
