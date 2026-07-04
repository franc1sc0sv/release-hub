import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ITrackedFlagRepository } from '../interfaces/tracked-flag.repository'
import type {
  ITrackedFlag,
  ICreateTrackedFlagData,
  ITrackedFlagWithDetails,
  IFlagBranchPresence,
} from '../interfaces/flag-tracking.interfaces'

interface ITrackedFlagRow {
  id: string
  projectId: string
  key: string
  featureId: string | null
  addedInPullRequestId: string | null
  removedInPullRequestId: string | null
  presentInCode: boolean
  createdAt: Date
  updatedAt: Date
}

interface ITrackedFlagWithDetailsRow extends ITrackedFlagRow {
  feature: { id: string; name: string } | null
  addedInPullRequest: { id: string; number: number } | null
  branchPresence: {
    id: string
    trackedFlagId: string
    branch: string
    present: boolean
    headSha: string | null
    firstSeenAt: Date
    lastConfirmedAt: Date
  }[]
}

function toITrackedFlag(row: ITrackedFlagRow): ITrackedFlag {
  return {
    id: row.id,
    projectId: row.projectId,
    key: row.key,
    featureId: row.featureId,
    addedInPullRequestId: row.addedInPullRequestId,
    removedInPullRequestId: row.removedInPullRequestId,
    presentInCode: row.presentInCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toIFlagBranchPresence(row: ITrackedFlagWithDetailsRow['branchPresence'][number]): IFlagBranchPresence {
  return {
    id: row.id,
    trackedFlagId: row.trackedFlagId,
    branch: row.branch,
    present: row.present,
    headSha: row.headSha,
    firstSeenAt: row.firstSeenAt,
    lastConfirmedAt: row.lastConfirmedAt,
  }
}

@Injectable()
export class TrackedFlagRepository extends ITrackedFlagRepository {
  findById = async (id: string, tx: TxClient): Promise<ITrackedFlag | null> => {
    const row = await tx.trackedFlag.findFirst({ where: { id, deletedAt: null } })
    if (!row) return null
    return toITrackedFlag(row)
  }

  findByIdWithDetails = async (id: string, tx: TxClient): Promise<ITrackedFlagWithDetails | null> => {
    const row = await tx.trackedFlag.findFirst({
      where: { id, deletedAt: null },
      include: {
        feature: { select: { id: true, name: true } },
        addedInPullRequest: { select: { id: true, number: true } },
        branchPresence: true,
      },
    })
    if (!row) return null
    return {
      ...toITrackedFlag(row),
      feature: row.feature,
      addedInPullRequest: row.addedInPullRequest,
      branchPresence: row.branchPresence.map(toIFlagBranchPresence),
    }
  }

  findByIdsWithDetails = async (ids: string[], tx: TxClient): Promise<ITrackedFlagWithDetails[]> => {
    if (ids.length === 0) return []
    const rows = await tx.trackedFlag.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: {
        feature: { select: { id: true, name: true } },
        addedInPullRequest: { select: { id: true, number: true } },
        branchPresence: true,
      },
    })
    return rows.map((row): ITrackedFlagWithDetails => ({
      ...toITrackedFlag(row),
      feature: row.feature,
      addedInPullRequest: row.addedInPullRequest,
      branchPresence: row.branchPresence.map(toIFlagBranchPresence),
    }))
  }

  findByProjectAndKey = async (projectId: string, key: string, tx: TxClient): Promise<ITrackedFlag | null> => {
    const row = await tx.trackedFlag.findFirst({ where: { projectId, key, deletedAt: null } })
    if (!row) return null
    return toITrackedFlag(row)
  }

  findByProjectAndKeyWithDetails = async (
    projectId: string,
    key: string,
    tx: TxClient,
  ): Promise<ITrackedFlagWithDetails | null> => {
    const row = await tx.trackedFlag.findFirst({
      where: { projectId, key, deletedAt: null },
      include: {
        feature: { select: { id: true, name: true } },
        addedInPullRequest: { select: { id: true, number: true } },
        branchPresence: true,
      },
    })
    if (!row) return null
    return {
      ...toITrackedFlag(row),
      feature: row.feature,
      addedInPullRequest: row.addedInPullRequest,
      branchPresence: row.branchPresence.map(toIFlagBranchPresence),
    }
  }

  upsertByProjectAndKey = async (data: ICreateTrackedFlagData, tx: TxClient): Promise<ITrackedFlag> => {
    const row = await tx.trackedFlag.upsert({
      where: { projectId_key: { projectId: data.projectId, key: data.key } },
      create: { projectId: data.projectId, key: data.key, presentInCode: data.presentInCode },
      update: { presentInCode: data.presentInCode },
    })
    return toITrackedFlag(row)
  }

  setAddedInPullRequest = async (
    trackedFlagId: string,
    pullRequestId: string,
    featureId: string | null,
    tx: TxClient,
  ): Promise<void> => {
    await tx.trackedFlag.update({
      where: { id: trackedFlagId },
      data: {
        addedInPullRequestId: pullRequestId,
        ...(featureId !== null && { featureId }),
      },
    })
  }

  setRemovedInPullRequest = async (
    trackedFlagId: string,
    pullRequestId: string,
    tx: TxClient,
  ): Promise<void> => {
    await tx.trackedFlag.update({
      where: { id: trackedFlagId },
      data: { removedInPullRequestId: pullRequestId },
    })
  }

  setPresentInCode = async (trackedFlagId: string, presentInCode: boolean, tx: TxClient): Promise<void> => {
    await tx.trackedFlag.update({
      where: { id: trackedFlagId },
      data: { presentInCode },
    })
  }

  findAllForProject = async (projectId: string, tx: TxClient): Promise<ITrackedFlagWithDetails[]> => {
    const rows = await tx.trackedFlag.findMany({
      where: { projectId, deletedAt: null },
      include: {
        feature: { select: { id: true, name: true } },
        addedInPullRequest: { select: { id: true, number: true } },
        branchPresence: true,
      },
    })
    return rows.map((row): ITrackedFlagWithDetails => ({
      ...toITrackedFlag(row),
      feature: row.feature,
      addedInPullRequest: row.addedInPullRequest,
      branchPresence: row.branchPresence.map(toIFlagBranchPresence),
    }))
  }
}
