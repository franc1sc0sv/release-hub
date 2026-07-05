import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { OrgRole, GithubInstallationStatus } from '@release-hub/db'
import type { IOrgMembership } from '@release-hub/shared'
import { IOrganizationRepository } from '../interfaces/organization.repository'
import type {
  IOrganization,
  IUserOrganization,
  IOrganizationMemberProfile,
} from '../interfaces/organization.interfaces'

@Injectable()
export class OrganizationRepository extends IOrganizationRepository {
  findById = async (id: string, tx: TxClient): Promise<IOrganization | null> => {
    const row = await tx.organization.findFirst({ where: { id, deletedAt: null } })
    if (!row) return null
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      githubInstallationId: row.githubInstallationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  findOrgMembershipsForUser = async (userId: string, tx: TxClient): Promise<IOrgMembership[]> => {
    const rows = await tx.organizationMembership.findMany({
      where: { userId, organization: { deletedAt: null } },
      select: { organizationId: true, role: true },
    })
    return rows.map((row) => ({ organizationId: row.organizationId, role: row.role }))
  }

  findOrganizationIdForProject = async (projectId: string, tx: TxClient): Promise<string | null> => {
    const row = await tx.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { organizationId: true },
    })
    return row?.organizationId ?? null
  }

  createOrganizationWithOwner = async (
    userId: string,
    name: string,
    tx: TxClient,
  ): Promise<{ id: string }> => {
    const row = await tx.organization.create({
      data: {
        name,
        memberships: { create: { userId, role: OrgRole.owner } },
      },
      select: { id: true },
    })
    return { id: row.id }
  }

  createForUser = async (
    userId: string,
    name: string,
    slug: string,
    tx: TxClient,
  ): Promise<{ id: string }> => {
    const row = await tx.organization.create({
      data: {
        name,
        slug,
        memberships: { create: { userId, role: OrgRole.owner } },
      },
      select: { id: true },
    })
    return { id: row.id }
  }

  updateName = async (
    organizationId: string,
    name: string,
    slug: string,
    tx: TxClient,
  ): Promise<IOrganization> => {
    const row = await tx.organization.update({
      where: { id: organizationId },
      data: { name, slug },
    })
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      githubInstallationId: row.githubInstallationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  softDelete = async (organizationId: string, tx: TxClient): Promise<void> => {
    await tx.organization.update({
      where: { id: organizationId },
      data: { deletedAt: new Date() },
    })
  }

  countActiveProjects = async (organizationId: string, tx: TxClient): Promise<number> => {
    return tx.project.count({ where: { organizationId, deletedAt: null } })
  }

  slugExists = async (slug: string, tx: TxClient): Promise<boolean> => {
    const row = await tx.organization.findFirst({ where: { slug }, select: { id: true } })
    return row !== null
  }

  findOrganizationsForUser = async (userId: string, tx: TxClient): Promise<IUserOrganization[]> => {
    const rows = await tx.organizationMembership.findMany({
      where: { userId, organization: { deletedAt: null } },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            githubInstallations: {
              where: { status: GithubInstallationStatus.active },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => ({
      id: row.organization.id,
      name: row.organization.name,
      slug: row.organization.slug,
      role: row.role,
      githubConnected: row.organization.githubInstallations.length > 0,
    }))
  }

  listMembers = async (
    organizationId: string,
    tx: TxClient,
  ): Promise<IOrganizationMemberProfile[]> => {
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

  findActiveInstallationIdForOrg = async (
    organizationId: string,
    tx: TxClient,
  ): Promise<string | null> => {
    const row = await tx.githubInstallation.findFirst({
      where: { organizationId, status: GithubInstallationStatus.active },
      orderBy: { createdAt: 'desc' },
      select: { installationId: true },
    })
    return row ? String(row.installationId) : null
  }
}
