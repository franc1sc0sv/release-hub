import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IProjectTagRepository } from '../interfaces/project-tag.repository'
import type { IProjectTag, ICreateProjectTagData } from '../interfaces/project-tag.interfaces'

@Injectable()
export class ProjectTagRepository extends IProjectTagRepository {
  findById = async (id: string, tx: TxClient): Promise<IProjectTag | null> => {
    const row = await tx.projectTag.findFirst({
      where: { id, deletedAt: null },
    })
    if (!row) return null
    return this.toIProjectTag(row)
  }

  listByProject = async (projectId: string, tx: TxClient): Promise<IProjectTag[]> => {
    const rows = await tx.projectTag.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((row) => this.toIProjectTag(row))
  }

  create = async (data: ICreateProjectTagData, tx: TxClient): Promise<IProjectTag> => {
    const row = await tx.projectTag.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        color: data.color,
      },
    })
    return this.toIProjectTag(row)
  }

  softDelete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.projectTag.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  existsByNames = async (projectId: string, names: string[], tx: TxClient): Promise<boolean> => {
    if (names.length === 0) return true
    const count = await tx.projectTag.count({
      where: {
        projectId,
        deletedAt: null,
        name: { in: names },
      },
    })
    return count === names.length
  }

  private toIProjectTag(row: {
    id: string
    projectId: string
    name: string
    color: string | null
    createdAt: Date
    updatedAt: Date
  }): IProjectTag {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      color: row.color,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
