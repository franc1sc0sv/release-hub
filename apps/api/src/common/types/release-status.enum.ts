import { registerEnumType } from '@nestjs/graphql'

export const ReleaseStatus = {
  DRAFT: 'draft',
  READY_TO_RELEASE: 'ready_to_release',
  MERGED: 'merged',
  DEPLOYED: 'deployed',
  CANCELED: 'canceled',
} as const

export type ReleaseStatus = (typeof ReleaseStatus)[keyof typeof ReleaseStatus]

registerEnumType(ReleaseStatus, { name: 'ReleaseStatus' })
