import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import type { InvitationStatus as PrismaInvitationStatus } from '@release-hub/db'
import type { OrgRole } from '@release-hub/db'
import { IInvitationRepository } from '../interfaces/collaboration.repository'
import type { IInvitation, ICreateInvitationData } from '../interfaces/collaboration.interfaces'
import { InvitationStatus } from '../../../common/types/invitation-status.enum'

@Injectable()
export class InvitationRepository extends IInvitationRepository {
  findById = async (id: string, tx: TxClient): Promise<IInvitation | null> => {
    const row = await tx.invitation.findUnique({ where: { id } })
    if (!row) return null
    return this.toIInvitation(row)
  }

  findByToken = async (token: string, tx: TxClient): Promise<IInvitation | null> => {
    const row = await tx.invitation.findUnique({ where: { token } })
    if (!row) return null
    return this.toIInvitation(row)
  }

  findPendingByOrgAndEmail = async (
    organizationId: string,
    email: string,
    tx: TxClient,
  ): Promise<IInvitation | null> => {
    const row = await tx.invitation.findFirst({
      where: {
        organizationId,
        email: { equals: email, mode: 'insensitive' },
        status: InvitationStatus.PENDING,
      },
    })
    if (!row) return null
    return this.toIInvitation(row)
  }

  findAllByOrganization = async (organizationId: string, tx: TxClient): Promise<IInvitation[]> => {
    const rows = await tx.invitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toIInvitation(row))
  }

  create = async (data: ICreateInvitationData, tx: TxClient): Promise<IInvitation> => {
    const row = await tx.invitation.create({
      data: {
        organizationId: data.organizationId,
        email: data.email,
        role: data.role,
        invitedById: data.invitedById,
        token: data.token,
        expiresAt: data.expiresAt,
        status: InvitationStatus.PENDING,
      },
    })
    return this.toIInvitation(row)
  }

  accept = async (id: string, tx: TxClient): Promise<IInvitation> => {
    const row = await tx.invitation.update({
      where: { id },
      data: { status: InvitationStatus.ACCEPTED },
    })
    return this.toIInvitation(row)
  }

  revoke = async (id: string, tx: TxClient): Promise<IInvitation> => {
    const row = await tx.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    })
    return this.toIInvitation(row)
  }

  markExpired = async (id: string, tx: TxClient): Promise<IInvitation> => {
    const row = await tx.invitation.update({
      where: { id },
      data: { status: InvitationStatus.EXPIRED },
    })
    return this.toIInvitation(row)
  }

  private toIInvitation(row: {
    id: string
    email: string
    organizationId: string
    role: OrgRole
    status: PrismaInvitationStatus
    token: string
    expiresAt: Date
    invitedById: string
    createdAt: Date
    updatedAt: Date
  }): IInvitation {
    return {
      id: row.id,
      email: row.email,
      organizationId: row.organizationId,
      role: row.role,
      status: row.status,
      token: row.token,
      expiresAt: row.expiresAt,
      invitedById: row.invitedById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
