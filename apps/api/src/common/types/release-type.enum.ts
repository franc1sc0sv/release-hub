import { registerEnumType } from '@nestjs/graphql'

export const ReleaseType = {
  FEATURE: 'feature',
  HOTFIX: 'hotfix',
} as const

export type ReleaseType = (typeof ReleaseType)[keyof typeof ReleaseType]

registerEnumType(ReleaseType, { name: 'ReleaseType' })
