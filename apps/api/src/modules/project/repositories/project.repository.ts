import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { DEFAULT_FEATURES } from '@release-hub/db'
import { ProjectRole } from '@release-hub/shared'
import { IProjectRepository } from '../interfaces/project.repository'
import type {
  IProject,
  ICreateProjectData,
  IUpdateProjectData,
  IProjectMembershipRecord,
  IProjectConnectionCredentials,
  IProjectIntegrationSettings,
} from '../interfaces/project.interfaces'

@Injectable()
export class ProjectRepository extends IProjectRepository {
  findById = async (id: string, tx: TxClient): Promise<IProject | null> => {
    const row = await tx.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
    })
    if (!row) return null
    return this.toIProject(row)
  }

  findAllForUser = async (userId: string, tx: TxClient): Promise<IProject[]> => {
    const rows = await tx.project.findMany({
      where: {
        deletedAt: null,
        memberships: { some: { userId } },
      },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => this.toIProject(row))
  }

  findAll = async (tx: TxClient): Promise<IProject[]> => {
    const rows = await tx.project.findMany({
      where: { deletedAt: null },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => this.toIProject(row))
  }

  findCredentials = async (
    id: string,
    tx: TxClient,
  ): Promise<IProjectConnectionCredentials | null> => {
    const row = await tx.project.findFirst({
      where: { id, deletedAt: null },
      select: {
        flagsmithUrl: true,
        flagsmithApiKey: true,
        flagsmithProjectId: true,
      },
    })
    if (!row) return null
    return {
      flagsmithUrl: row.flagsmithUrl,
      flagsmithApiKey: row.flagsmithApiKey,
      flagsmithProjectId: row.flagsmithProjectId,
    }
  }

  findMembershipsForUser = async (
    userId: string,
    tx: TxClient,
  ): Promise<IProjectMembershipRecord[]> => {
    const rows = await tx.membership.findMany({
      where: { userId },
      select: { projectId: true, role: true },
    })
    return rows.map((row) => ({ projectId: row.projectId, role: row.role }))
  }

  create = async (data: ICreateProjectData, tx: TxClient): Promise<IProject> => {
    const row = await tx.project.create({
      data: {
        name: data.name,
        repo: data.repo,
        memberships: {
          create: { userId: data.ownerId, role: ProjectRole.OWNER },
        },
      },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
    })
    return this.toIProject(row)
  }

  createDefaultFeatures = async (projectId: string, tx: TxClient): Promise<void> => {
    await tx.feature.createMany({
      data: DEFAULT_FEATURES.map((def) => ({
        projectId,
        name: def.name,
        description: def.description,
        kind: def.kind,
        tags: [],
        suggested: false,
      })),
    })
  }

  update = async (id: string, data: IUpdateProjectData, tx: TxClient): Promise<IProject> => {
    const row = await tx.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.repo !== undefined && { repo: data.repo }),
      },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
    })
    return this.toIProject(row)
  }

  updateIntegrationSettings = async (
    id: string,
    data: IProjectIntegrationSettings,
    tx: TxClient,
  ): Promise<IProject> => {
    const row = await tx.project.update({
      where: { id },
      data: {
        ...(data.linearEnabled !== undefined && { linearEnabled: data.linearEnabled }),
        ...(data.flagsmithApiKey !== undefined && { flagsmithApiKey: data.flagsmithApiKey }),
        ...(data.flagsmithApiKey !== undefined && { flagsmithEnabled: data.flagsmithApiKey !== null }),
        ...(data.flagsmithUrl !== undefined && { flagsmithUrl: data.flagsmithUrl }),
        ...(data.flagsmithProjectId !== undefined && { flagsmithProjectId: data.flagsmithProjectId }),
      },
      include: {
        memberships: {
          where: { role: ProjectRole.OWNER },
          select: { userId: true },
          take: 1,
        },
      },
    })
    return this.toIProject(row)
  }

  delete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  private toIProject(
    row: {
      id: string
      name: string
      repo: string
      githubInstallationId: string | null
      linearEnabled: boolean
      flagsmithEnabled: boolean
      createdAt: Date
      updatedAt: Date
      memberships: { userId: string }[]
    },
  ): IProject {
    return {
      id: row.id,
      name: row.name,
      repo: row.repo,
      githubInstallationId: row.githubInstallationId,
      linearEnabled: row.linearEnabled,
      flagsmithEnabled: row.flagsmithEnabled,
      integrations: {
        github: row.githubInstallationId !== null,
        linear: row.linearEnabled,
        flagsmith: row.flagsmithEnabled,
      },
      ownerId: row.memberships[0]?.userId ?? '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
