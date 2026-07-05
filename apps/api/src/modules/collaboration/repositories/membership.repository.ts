import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { OrgRole } from '@release-hub/db'
import { IMembershipRepository } from '../interfaces/collaboration.repository'
import type { IMembership, IMemberProfile, IUpdateMembershipData } from '../interfaces/collaboration.interfaces'

@Injectable()
export class MembershipRepository extends IMembershipRepository {
  findById = async (id: string, tx: TxClient): Promise<IMembership | null> => {
    const row = await tx.organizationMembership.findUnique({ where: { id } })
    if (!row) return null
    return this.toIMembership(row)
  }

  findProfileById = async (id: string, tx: TxClient): Promise<IMemberProfile | null> => {
    const row = await tx.organizationMembership.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    })
    if (!row) return null
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      name: row.user.name,
      email: row.user.email,
      avatarUrl: row.user.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  findByOrgAndUser = async (
    organizationId: string,
    userId: string,
    tx: TxClient,
  ): Promise<IMembership | null> => {
    const row = await tx.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    })
    if (!row) return null
    return this.toIMembership(row)
  }

  findByOrgAndEmail = async (
    organizationId: string,
    email: string,
    tx: TxClient,
  ): Promise<IMembership | null> => {
    const row = await tx.organizationMembership.findFirst({
      where: { organizationId, user: { email: { equals: email, mode: 'insensitive' }, deletedAt: null } },
    })
    if (!row) return null
    return this.toIMembership(row)
  }

  findAllByOrganization = async (organizationId: string, tx: TxClient): Promise<IMemberProfile[]> => {
    const rows = await tx.organizationMembership.findMany({
      where: { organizationId },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      name: row.user.name,
      email: row.user.email,
      avatarUrl: row.user.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  countOwners = async (organizationId: string, tx: TxClient): Promise<number> => {
    return tx.organizationMembership.count({ where: { organizationId, role: OrgRole.owner } })
  }

  create = async (
    userId: string,
    organizationId: string,
    role: OrgRole,
    tx: TxClient,
  ): Promise<IMembership> => {
    const row = await tx.organizationMembership.create({ data: { userId, organizationId, role } })
    return this.toIMembership(row)
  }

  update = async (id: string, data: IUpdateMembershipData, tx: TxClient): Promise<IMembership> => {
    const row = await tx.organizationMembership.update({ where: { id }, data: { role: data.role } })
    return this.toIMembership(row)
  }

  delete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.organizationMembership.delete({ where: { id } })
  }

  private toIMembership(row: {
    id: string
    userId: string
    organizationId: string
    role: OrgRole
    createdAt: Date
    updatedAt: Date
  }): IMembership {
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
