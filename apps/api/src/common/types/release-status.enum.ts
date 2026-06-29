import { registerEnumType } from '@nestjs/graphql'

export const ReleaseStatus = {
  DRAFT: 'draft',
  PR_CREATED: 'pr_created',
  MERGED: 'merged',
  DEPLOYED: 'deployed',
} as const

export type ReleaseStatus = (typeof ReleaseStatus)[keyof typeof ReleaseStatus]

registerEnumType(ReleaseStatus, { name: 'ReleaseStatus' })
