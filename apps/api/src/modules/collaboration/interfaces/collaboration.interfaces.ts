import type { OrgRole } from '@release-hub/shared'
import type { InvitationStatus } from '../../../common/types/invitation-status.enum'

export interface IMembership {
  id: string
  userId: string
  organizationId: string
  role: OrgRole
  createdAt: Date
  updatedAt: Date
}

export interface IMemberProfile {
  id: string
  userId: string
  organizationId: string
  role: OrgRole
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IInvitation {
  id: string
  email: string
  organizationId: string
  role: OrgRole
  status: InvitationStatus
  token: string
  expiresAt: Date
  invitedById: string
  createdAt: Date
  updatedAt: Date
}

export interface ICreateInvitationData {
  email: string
  organizationId: string
  role: OrgRole
  invitedById: string
  token: string
  expiresAt: Date
}

export interface IInvitationEmailContext {
  inviterName: string
  organizationName: string
  acceptToken: string
}

export interface IUpdateMembershipData {
  role: OrgRole
}
