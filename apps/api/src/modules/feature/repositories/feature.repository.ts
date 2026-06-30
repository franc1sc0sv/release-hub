import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import {
  ReleaseStatus as PrismaReleaseStatus,
  FeatureState as PrismaFeatureState,
} from '@release-hub/db'
import { IFeatureRepository } from '../interfaces/feature.repository'
import type { ICreateSuggestedFeatureData } from '../interfaces/feature.repository'
import type { IFeature, ICreateFeatureData, IFeaturePullRequest, IFeatureCommit, IFeatureTicketLink } from '../interfaces/feature.interfaces'
import type { IRelease } from '../../release/interfaces/release.interfaces'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { ReleaseStatus } from '../../../common/types/release-status.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { TicketSource } from '../../../common/types/ticket-source.enum'

const prismaToAppReleaseStatus: Record<string, ReleaseStatus> = {
  [PrismaReleaseStatus.draft]: ReleaseStatus.DRAFT,
  [PrismaReleaseStatus.ready_to_release]: ReleaseStatus.READY_TO_RELEASE,
  [PrismaReleaseStatus.merged]: ReleaseStatus.MERGED,
  [PrismaReleaseStatus.deployed]: ReleaseStatus.DEPLOYED,
  [PrismaReleaseStatus.canceled]: ReleaseStatus.CANCELED,
}

const prismaToAppAiDraftStatus: Record<string, AiDraftStatus> = {
  pending: AiDraftStatus.PENDING,
  running: AiDraftStatus.RUNNING,
  ready: AiDraftStatus.READY,
  failed: AiDraftStatus.FAILED,
}

const prismaToAppState: Record<string, FeatureState> = {
  [PrismaFeatureState.in_progress]: FeatureState.IN_PROGRESS,
  [PrismaFeatureState.shipped_flag_off]: FeatureState.SHIPPED_FLAG_OFF,
  [PrismaFeatureState.live_staging]: FeatureState.LIVE_STAGING,
  [PrismaFeatureState.live_prod]: FeatureState.LIVE_PROD,
  [PrismaFeatureState.partial]: FeatureState.PARTIAL,
  [PrismaFeatureState.fully_released]: FeatureState.FULLY_RELEASED,
  [PrismaFeatureState.flag_cleanup_pending]: FeatureState.FLAG_CLEANUP_PENDING,
  [PrismaFeatureState.blocked]: FeatureState.BLOCKED,
}

@Injectable()
export class FeatureRepository extends IFeatureRepository {
  findById = async (id: string, tx: TxClient): Promise<IFeature | null> => {
    const row = await tx.feature.findFirst({
      where: { id, deletedAt: null },
    })
    if (!row) return null
    return this.toIFeature(row)
  }

  findAllByProject = async (projectId: string, tx: TxClient): Promise<IFeature[]> => {
    const rows = await tx.feature.findMany({
      where: { projectId, deletedAt: null },
      orderBy: [{ kind: 'desc' }, { createdAt: 'asc' }],
    })
    return rows.map((row) => this.toIFeature(row))
  }

  updateState = async (id: string, state: FeatureState, tx: TxClient): Promise<IFeature> => {
    const row = await tx.feature.update({
      where: { id },
      data: { state },
    })
    return this.toIFeature(row)
  }

  create = async (data: ICreateFeatureData, tx: TxClient): Promise<IFeature> => {
    const row = await tx.feature.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        kind: FeatureKind.PRODUCT,
        tags: data.tags ?? [],
        suggested: false,
      },
    })
    return this.toIFeature(row)
  }

  findReleasesForFeature = async (featureId: string, tx: TxClient): Promise<IRelease[]> => {
    const rows = await tx.release.findMany({
      where: { deletedAt: null, pullRequests: { some: { featureId } } },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toIRelease(row))
  }

  findPullRequestsForFeature = async (featureId: string, tx: TxClient): Promise<IFeaturePullRequest[]> => {
    const rows = await tx.pullRequest.findMany({
      where: { featureId, release: { deletedAt: null } },
      include: {
        commits: { orderBy: { committedAt: 'asc' } },
        ticketLinks: true,
      },
    })
    return rows.map((r) => this.toIFeaturePullRequest(r))
  }

  findSuggestedByIds = async (ids: string[], tx: TxClient): Promise<IFeature[]> => {
    const rows = await tx.feature.findMany({
      where: { id: { in: ids }, suggested: true, deletedAt: null },
    })
    return rows.map((row) => this.toIFeature(row))
  }

  findSuggestedByProject = async (projectId: string, tx: TxClient): Promise<IFeature[]> => {
    const rows = await tx.feature.findMany({
      where: { projectId, suggested: true, deletedAt: null },
    })
    return rows.map((row) => this.toIFeature(row))
  }

  createSuggested = async (data: ICreateSuggestedFeatureData, tx: TxClient): Promise<IFeature> => {
    const row = await tx.feature.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        kind: FeatureKind.PRODUCT,
        tags: [],
        suggested: true,
      },
    })
    return this.toIFeature(row)
  }

  update = async (
    id: string,
    data: Partial<Pick<IFeature, 'name' | 'description' | 'tags'>>,
    tx: TxClient,
  ): Promise<IFeature> => {
    const row = await tx.feature.update({
      where: { id },
      data,
    })
    return this.toIFeature(row)
  }

  acceptSuggested = async (
    id: string,
    data: Partial<Pick<IFeature, 'name' | 'description' | 'tags'>>,
    tx: TxClient,
  ): Promise<IFeature> => {
    const row = await tx.feature.update({
      where: { id },
      data: { suggested: false, ...data },
    })
    return this.toIFeature(row)
  }

  softDelete = async (id: string, tx: TxClient): Promise<void> => {
    await tx.feature.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  private toIRelease(row: {
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
    createdAt: Date
    updatedAt: Date
  }): IRelease {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      baseRef: row.baseRef,
      compareRef: row.compareRef,
      status: prismaToAppReleaseStatus[row.status] ?? ReleaseStatus.DRAFT,
      aiDraftStatus: prismaToAppAiDraftStatus[row.aiDraftStatus] ?? AiDraftStatus.PENDING,
      prUrl: row.prUrl,
      tags: row.tags,
      summary: row.summary,
      summaryEditedAt: row.summaryEditedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  private toIFeatureCommit(row: {
    id: string
    pullRequestId: string
    sha: string
    message: string
    author: string
    committedAt: Date
  }): IFeatureCommit {
    return {
      id: row.id,
      pullRequestId: row.pullRequestId,
      sha: row.sha,
      message: row.message,
      author: row.author,
      committedAt: row.committedAt,
    }
  }

  private toIFeatureTicketLink(row: {
    issueId: string
    source: string
    url: string
    title: string
    confidence: number
  } | null): IFeatureTicketLink | null {
    if (!row) return null
    return {
      issueId: row.issueId,
      source: row.source as TicketSource,
      url: row.url,
      title: row.title,
      confidence: row.confidence,
    }
  }



  private toIFeaturePullRequest(row: {
    id: string
    number: number
    title: string
    body: string | null
    author: string
    mergedAt: Date
    releaseId: string
    featureId: string | null
    aiConfidence: number | null
    aiRationale: string | null
    commits: Array<{ id: string; pullRequestId: string; sha: string; message: string; author: string; committedAt: Date }>
    ticketLinks: Array<{ issueId: string; source: string; url: string; title: string; confidence: number }>
  }): IFeaturePullRequest {
    return {
      id: row.id,
      number: row.number,
      title: row.title,
      body: row.body,
      author: row.author,
      mergedAt: row.mergedAt,
      releaseId: row.releaseId,
      featureId: row.featureId,
      aiConfidence: row.aiConfidence,
      aiRationale: row.aiRationale,
      commits: row.commits.map((c) => this.toIFeatureCommit(c)),
      tickets: row.ticketLinks.map((t) => this.toIFeatureTicketLink(t)).filter((t): t is IFeatureTicketLink => t !== null),
    }
  }

  private toIFeature(row: {
    id: string
    projectId: string
    name: string
    description: string
    kind: string
    tags: string[]
    suggested: boolean
    state: string
    createdAt: Date
    updatedAt: Date
  }): IFeature {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      kind: row.kind as FeatureKind,
      tags: row.tags,
      suggested: row.suggested,
      state: prismaToAppState[row.state] ?? FeatureState.IN_PROGRESS,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
