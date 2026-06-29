import type { ProjectRole } from '../../../common/types/project-role.enum'
import type { InvitationStatus } from '../../../common/types/invitation-status.enum'

export interface IMembership {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  createdAt: Date
  updatedAt: Date
}

export interface IMemberProfile {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  name: string
  email: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IInvitation {
  id: string
  email: string
  projectId: string
  role: ProjectRole
  status: InvitationStatus
  token: string
  expiresAt: Date
  invitedById: string
  createdAt: Date
  updatedAt: Date
}

export interface ICreateInvitationData {
  email: string
  projectId: string
  role: ProjectRole
  invitedById: string
  token: string
  expiresAt: Date
}

export interface IInvitationEmailContext {
  inviterName: string
  projectName: string
  acceptToken: string
}

export interface IUpdateMembershipData {
  role: ProjectRole
}
