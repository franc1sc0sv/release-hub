import type { IMemberProfile, IInvitation } from '../interfaces/collaboration.interfaces'
import { MemberType } from './member.type'
import { InvitationType } from './invitation.type'

export function toMemberType(profile: IMemberProfile): MemberType {
  const out = new MemberType()
  out.id = profile.id
  out.userId = profile.userId
  out.projectId = profile.projectId
  out.role = profile.role
  out.name = profile.name
  out.email = profile.email
  out.avatarUrl = profile.avatarUrl
  out.createdAt = profile.createdAt
  out.updatedAt = profile.updatedAt
  return out
}

export function toInvitationType(invitation: IInvitation): InvitationType {
  const out = new InvitationType()
  out.id = invitation.id
  out.email = invitation.email
  out.projectId = invitation.projectId
  out.role = invitation.role
  out.status = invitation.status
  out.expiresAt = invitation.expiresAt
  out.invitedById = invitation.invitedById
  out.createdAt = invitation.createdAt
  out.updatedAt = invitation.updatedAt
  return out
}
