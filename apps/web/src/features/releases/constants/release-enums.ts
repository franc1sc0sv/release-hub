import type { AiDraftStatus, ReleaseStatus } from '@/generated/graphql'

export const ReleaseStatusValue = {
  DRAFT: 'DRAFT',
  PR_CREATED: 'PR_CREATED',
  MERGED: 'MERGED',
  DEPLOYED: 'DEPLOYED',
} as const satisfies Record<ReleaseStatus, ReleaseStatus>

export const AiDraftStatusValue = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<AiDraftStatus, AiDraftStatus>
