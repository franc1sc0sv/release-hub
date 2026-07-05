import type { InvitationStatus, OrgRole } from '@/generated/graphql'

export const GqlInvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const satisfies Record<string, InvitationStatus>

export const GqlOrgRole = {
  OWNER: 'owner',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const satisfies Record<string, OrgRole>

export const ORG_ROLES: OrgRole[] = [
  GqlOrgRole.OWNER,
  GqlOrgRole.MEMBER,
  GqlOrgRole.VIEWER,
]
