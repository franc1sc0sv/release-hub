import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ProjectRole } from '@release-hub/shared'
import { IMembershipRepository } from '../interfaces/collaboration.repository'
import type { IMembership, IMemberProfile, IUpdateMembershipData } from '../interfaces/collaboration.interfaces'

@Injectable()
export class MembershipRepository extends IMembershipRepository {
  findById = async (id: string, tx: TxClient): Promise<IMembership | null> => {
    const row = await tx.membership.findUnique({ where: { id } })
    if (!row) return null
    return this.toIMembership(row)
  }

  findProfileById = async (id: string, tx: TxClient): Promise<IMemberProfile | null> => {
    const row = await tx.membership.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    })
    if (!row) return null
    return {
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      role: row.role,
      name: row.user.name,
      email: row.user.email,
      avatarUrl: row.user.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  findByProjectAndUser = async (
    projectId: string,
    userId: string,
    tx: TxClient,
  ): Promise<IMembership | null> => {
    const row = await tx.membership.findUnique({ where: { userId_projectId: { userId, projectId } } })
    if (!row) return null
    return this.toIMembership(row)
  }

  findByProjectAndEmail = async (
    projectId: string,
    email: string,
    tx: TxClient,
  ): Promise<IMembership | null> => {
    const row = await tx.membership.findFirst({
      where: { projectId, user: { email: { equals: email, mode: 'insensitive' }, deletedAt: null } },
    })
    if (!row) return null
    return this.toIMembership(row)
  }

  findAllByProject = async (projectId: string, tx: TxClient): Promise<IMemberProfile[]> => {
    const rows = await tx.membership.findMany({
      where: { projectId },
      include: { user: { select: { name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      role: row.role,
      name: row.user.name,
      email: row.user.email,
      avatarUrl: row.user.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  countOwners = async (projectId: string, tx: TxClient): Promise<number> => {
    return tx.membership.count({ where: { projectId, role: ProjectRole.OWNER } })
  }

  create = async (
    userId: string,
    projectId: string,
    role: ProjectRole,
    tx: TxClient,
  ): Promise<IMembership> => {
    const row = await tx.membership.create({ data: { userId, projectId, role } })
    return this.toIMembership(row)
  }

  update = async (id: string, data: IUpdateMembershipData, tx: TxClient): Promise<IMembership> => {
    const row = await tx.membership.update({ where: { id }, data: { role: data.role } })
    return this.toIMembership(row)
  }

  delete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.membership.delete({ where: { id } })
  }

  private toIMembership(row: {
    id: string
    userId: string
    projectId: string
    role: ProjectRole
    createdAt: Date
    updatedAt: Date
  }): IMembership {
    return {
      id: row.id,
      userId: row.userId,
      projectId: row.projectId,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
