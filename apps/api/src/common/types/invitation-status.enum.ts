import { registerEnumType } from '@nestjs/graphql'

export const InvitationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]

registerEnumType(InvitationStatus, { name: 'InvitationStatus' })
