import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import type { FlagAction, FlagReferenceKind } from '@release-hub/db'
import {
  IPullRequestFlagChangeRepository,
  type ICreatePullRequestFlagChangeData,
} from '../interfaces/pull-request-flag-change.repository'
import type {
  IPullRequestFlagChange,
  IPullRequestFlagChangeWithPullRequest,
} from '../interfaces/flag-tracking.interfaces'

interface IPullRequestFlagChangeRow {
  id: string
  pullRequestId: string
  trackedFlagId: string
  action: FlagAction
  kind: IPullRequestFlagChange['kind']
  detectedFile: string | null
  createdAt: Date
}

interface IPullRequestFlagChangeWithPullRequestRow extends IPullRequestFlagChangeRow {
  trackedFlag: { key: string }
  pullRequest: {
    id: string
    number: number
    title: string
    author: string
    mergedAt: Date
    releaseId: string
    release: { project: { repo: string } }
  }
}

function toIPullRequestFlagChange(row: IPullRequestFlagChangeRow): IPullRequestFlagChange {
  return {
    id: row.id,
    pullRequestId: row.pullRequestId,
    trackedFlagId: row.trackedFlagId,
    action: row.action,
    kind: row.kind,
    detectedFile: row.detectedFile,
    createdAt: row.createdAt,
  }
}

function toIPullRequestFlagChangeWithPullRequest(
  row: IPullRequestFlagChangeWithPullRequestRow,
): IPullRequestFlagChangeWithPullRequest {
  return {
    ...toIPullRequestFlagChange(row),
    flagKey: row.trackedFlag.key,
    pullRequest: {
      id: row.pullRequest.id,
      number: row.pullRequest.number,
      title: row.pullRequest.title,
      author: row.pullRequest.author,
      mergedAt: row.pullRequest.mergedAt,
      releaseId: row.pullRequest.releaseId,
      projectRepo: row.pullRequest.release.project.repo,
    },
  }
}

@Injectable()
export class PullRequestFlagChangeRepository extends IPullRequestFlagChangeRepository {
  findById = async (id: string, tx: TxClient): Promise<IPullRequestFlagChange | null> => {
    const row = await tx.pullRequestFlagChange.findFirst({ where: { id } })
    if (!row) return null
    return toIPullRequestFlagChange(row)
  }

  create = async (data: ICreatePullRequestFlagChangeData, tx: TxClient): Promise<IPullRequestFlagChange> => {
    const row = await tx.pullRequestFlagChange.create({
      data: {
        pullRequestId: data.pullRequestId,
        trackedFlagId: data.trackedFlagId,
        action: data.action,
        kind: data.kind,
        detectedFile: data.detectedFile,
      },
    })
    return toIPullRequestFlagChange(row)
  }

  findExisting = async (
    pullRequestId: string,
    trackedFlagId: string,
    action: FlagAction,
    kind: FlagReferenceKind,
    tx: TxClient,
  ): Promise<IPullRequestFlagChange | null> => {
    const row = await tx.pullRequestFlagChange.findFirst({ where: { pullRequestId, trackedFlagId, action, kind } })
    if (!row) return null
    return toIPullRequestFlagChange(row)
  }

  findAllForTrackedFlag = async (
    trackedFlagId: string,
    tx: TxClient,
  ): Promise<IPullRequestFlagChangeWithPullRequest[]> => {
    const rows = await tx.pullRequestFlagChange.findMany({
      where: { trackedFlagId },
      include: {
        trackedFlag: { select: { key: true } },
        pullRequest: {
          select: {
            id: true,
            number: true,
            title: true,
            author: true,
            mergedAt: true,
            releaseId: true,
            release: { select: { project: { select: { repo: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toIPullRequestFlagChangeWithPullRequest)
  }

  findAllForPullRequestIds = async (
    pullRequestIds: string[],
    tx: TxClient,
  ): Promise<IPullRequestFlagChangeWithPullRequest[]> => {
    if (pullRequestIds.length === 0) return []
    const rows = await tx.pullRequestFlagChange.findMany({
      where: { pullRequestId: { in: pullRequestIds } },
      include: {
        trackedFlag: { select: { key: true } },
        pullRequest: {
          select: {
            id: true,
            number: true,
            title: true,
            author: true,
            mergedAt: true,
            releaseId: true,
            release: { select: { project: { select: { repo: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toIPullRequestFlagChangeWithPullRequest)
  }

  deleteForPullRequestIds = async (pullRequestIds: string[], tx: TxClient): Promise<void> => {
    if (pullRequestIds.length === 0) return
    await tx.pullRequestFlagChange.deleteMany({ where: { pullRequestId: { in: pullRequestIds } } })
  }
}
