import type { InvitationStatus, ProjectRole } from '@/generated/graphql'

export const GqlInvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const satisfies Record<string, InvitationStatus>

export const GqlProjectRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const satisfies Record<string, ProjectRole>

export const PROJECT_ROLES: ProjectRole[] = [
  GqlProjectRole.OWNER,
  GqlProjectRole.MEMBER,
  GqlProjectRole.VIEWER,
]
