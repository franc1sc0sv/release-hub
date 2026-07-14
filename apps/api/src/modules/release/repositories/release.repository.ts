import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { kysely } from '@release-hub/db'
import { sql } from 'kysely'
import { ReleaseStatus } from '../../../common/types/release-status.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { IReleaseRepository } from '../interfaces/release.repository'
import type {
  IRelease,
  ICreateReleaseData,
  IUpdateReleaseData,
  IReleasesPageFilters,
  IReleasesPage,
} from '../interfaces/release.interfaces'

const MAX_RELEASES_PAGE_LIMIT = 50

type ReleaseRow = {
  id: string
  projectId: string
  name: string | null
  baseRef: string
  compareRef: string
  status: string
  aiDraftStatus: string
  prUrl: string | null
  tags: string[]
  summary: string | null
  summaryEditedAt: Date | null
  deployedAt: Date | null
  githubDeploymentId: string | null
  createdAt: Date
  updatedAt: Date
}

const STATUS_MAP: Record<string, ReleaseStatus> = {
  draft: ReleaseStatus.DRAFT,
  ready_to_release: ReleaseStatus.READY_TO_RELEASE,
  merged: ReleaseStatus.MERGED,
  deployed: ReleaseStatus.DEPLOYED,
  canceled: ReleaseStatus.CANCELED,
}

const AI_STATUS_MAP: Record<string, AiDraftStatus> = {
  pending: AiDraftStatus.PENDING,
  running: AiDraftStatus.RUNNING,
  ready: AiDraftStatus.READY,
  failed: AiDraftStatus.FAILED,
}

@Injectable()
export class ReleaseRepository extends IReleaseRepository {
  findById = async (id: string, tx: TxClient): Promise<IRelease | null> => {
    const row = await tx.release.findFirst({ where: { id, deletedAt: null } })
    if (!row) return null
    return this.toIRelease(row)
  }

  findAllByProject = async (projectId: string, tx: TxClient): Promise<IRelease[]> => {
    const rows = await tx.release.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toIRelease(row))
  }

  findPageByProject = async (filters: IReleasesPageFilters, tx: TxClient): Promise<IReleasesPage> => {
    const limit = Math.min(filters.limit, MAX_RELEASES_PAGE_LIMIT)
    const search = filters.search?.trim() ?? ''

    let countQuery = kysely
      .selectFrom('releases')
      .select(({ fn }) => fn.countAll<string>().as('total'))
      .where('project_id', '=', filters.projectId)
      .where('deleted_at', 'is', null)

    let idsQuery = kysely
      .selectFrom('releases')
      .select('id')
      .where('project_id', '=', filters.projectId)
      .where('deleted_at', 'is', null)

    if (search) {
      const pattern = `%${search}%`
      const searchCondition = sql<boolean>`(name ilike ${pattern} or exists (
        select 1 from unnest(tags) as tag where tag ilike ${pattern}
      ))`
      countQuery = countQuery.where(searchCondition)
      idsQuery = idsQuery.where(searchCondition)
    }

    const compiledCount = countQuery.compile()
    const countRows = await tx.$queryRawUnsafe<{ total: string }[]>(
      compiledCount.sql,
      ...compiledCount.parameters,
    )
    const totalCount = Number(countRows[0]?.total ?? 0)

    const compiledIds = idsQuery
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(filters.offset)
      .compile()
    const idRows = await tx.$queryRawUnsafe<{ id: string }[]>(compiledIds.sql, ...compiledIds.parameters)
    const orderedIds = idRows.map((row) => row.id)

    if (orderedIds.length === 0) {
      return { items: [], totalCount, hasMore: false }
    }

    const rows = await tx.release.findMany({ where: { id: { in: orderedIds } } })
    const rowsById = new Map(rows.map((row) => [row.id, row]))
    const items = orderedIds
      .map((id) => rowsById.get(id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .map((row) => this.toIRelease(row))

    return { items, totalCount, hasMore: filters.offset + items.length < totalCount }
  }

  create = async (data: ICreateReleaseData, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        baseRef: data.baseRef,
        compareRef: data.compareRef,
        tags: data.tags,
        status: ReleaseStatus.DRAFT,
        aiDraftStatus: AiDraftStatus.PENDING,
      },
    })
    return this.toIRelease(row)
  }

  update = async (id: string, data: IUpdateReleaseData, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: {
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
      },
    })
    return this.toIRelease(row)
  }

  updateStatus = async (
    id: string,
    status: ReleaseStatus,
    prUrl: string | null,
    tx: TxClient,
  ): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: { status, prUrl },
    })
    return this.toIRelease(row)
  }

  setStatus = async (id: string, status: ReleaseStatus, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: { status },
    })
    return this.toIRelease(row)
  }

  setDeployedStatus = async (
    id: string,
    status: ReleaseStatus,
    deployedAt: Date,
    githubDeploymentId: string | null,
    tx: TxClient,
  ): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: {
        status,
        deployedAt,
        ...(githubDeploymentId !== null && { githubDeploymentId }),
      },
    })
    return this.toIRelease(row)
  }

  updateAiDraftStatus = async (id: string, status: AiDraftStatus, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: { aiDraftStatus: status },
    })
    return this.toIRelease(row)
  }

  updateAiDraftStatusBulk = async (ids: string[], status: AiDraftStatus, tx: TxClient): Promise<void> => {
    await tx.release.updateMany({
      where: { id: { in: ids } },
      data: { aiDraftStatus: status },
    })
  }

  findIdsByAiDraftStatus = async (status: AiDraftStatus, tx: TxClient): Promise<string[]> => {
    const rows = await tx.release.findMany({
      where: { aiDraftStatus: status, deletedAt: null },
      select: { id: true },
    })
    return rows.map((r) => r.id)
  }

  updateSummary = async (id: string, summary: string, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: { summary, summaryEditedAt: new Date() },
    })
    return this.toIRelease(row)
  }

  softDelete = async (id: string, tx: TxClient): Promise<IRelease> => {
    const row = await tx.release.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return this.toIRelease(row)
  }

  private toIRelease(row: ReleaseRow): IRelease {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      baseRef: row.baseRef,
      compareRef: row.compareRef,
      status: STATUS_MAP[row.status] ?? ReleaseStatus.DRAFT,
      aiDraftStatus: AI_STATUS_MAP[row.aiDraftStatus] ?? AiDraftStatus.PENDING,
      prUrl: row.prUrl,
      tags: row.tags,
      summary: row.summary,
      summaryEditedAt: row.summaryEditedAt,
      deployedAt: row.deployedAt,
      githubDeploymentId: row.githubDeploymentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
