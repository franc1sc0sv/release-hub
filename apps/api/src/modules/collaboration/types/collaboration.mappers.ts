import type { IMemberProfile, IInvitation, IReceivedInvitation } from '../interfaces/collaboration.interfaces'
import { MemberType } from './member.type'
import { InvitationType } from './invitation.type'
import { ReceivedInvitationType } from './received-invitation.type'

export function toMemberType(profile: IMemberProfile): MemberType {
  const out = new MemberType()
  out.id = profile.id
  out.userId = profile.userId
  out.organizationId = profile.organizationId
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
  out.organizationId = invitation.organizationId
  out.role = invitation.role
  out.status = invitation.status
  out.expiresAt = invitation.expiresAt
  out.invitedById = invitation.invitedById
  out.createdAt = invitation.createdAt
  out.updatedAt = invitation.updatedAt
  return out
}

export function toReceivedInvitationType(invitation: IReceivedInvitation): ReceivedInvitationType {
  const out = new ReceivedInvitationType()
  out.id = invitation.id
  out.token = invitation.token
  out.organizationId = invitation.organizationId
  out.organizationName = invitation.organizationName
  out.inviterName = invitation.inviterName
  out.role = invitation.role
  out.expiresAt = invitation.expiresAt
  out.createdAt = invitation.createdAt
  return out
}
