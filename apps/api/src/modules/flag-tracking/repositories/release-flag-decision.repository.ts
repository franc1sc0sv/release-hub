import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ReleaseFlagDecisionType, ReleaseStatus } from '@release-hub/db'
import {
  IReleaseFlagDecisionRepository,
} from '../interfaces/release-flag-decision.repository'
import type { IActiveEnableDecisionForFlag } from '../interfaces/release-flag-decision.repository'
import type {
  ICreateReleaseFlagDecisionData,
  IReleaseFlagDecision,
  ILatestInProgressFlagDecision,
  ILatestFlagDecisionForProject,
} from '../interfaces/flag-tracking.interfaces'

interface IReleaseFlagDecisionRow {
  id: string
  releaseId: string
  trackedFlagId: string
  decision: ReleaseFlagDecisionType
  decidedById: string | null
  decidedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function toIReleaseFlagDecision(row: IReleaseFlagDecisionRow): IReleaseFlagDecision {
  return {
    id: row.id,
    releaseId: row.releaseId,
    trackedFlagId: row.trackedFlagId,
    decision: row.decision,
    decidedById: row.decidedById,
    decidedAt: row.decidedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

@Injectable()
export class ReleaseFlagDecisionRepository extends IReleaseFlagDecisionRepository {
  findById = async (id: string, tx: TxClient): Promise<IReleaseFlagDecision | null> => {
    const row = await tx.releaseFlagDecision.findFirst({ where: { id } })
    if (!row) return null
    return toIReleaseFlagDecision(row)
  }

  findByReleaseAndFlag = async (
    releaseId: string,
    trackedFlagId: string,
    tx: TxClient,
  ): Promise<IReleaseFlagDecision | null> => {
    const row = await tx.releaseFlagDecision.findFirst({ where: { releaseId, trackedFlagId } })
    if (!row) return null
    return toIReleaseFlagDecision(row)
  }

  findAllForRelease = async (releaseId: string, tx: TxClient): Promise<IReleaseFlagDecision[]> => {
    const rows = await tx.releaseFlagDecision.findMany({ where: { releaseId } })
    return rows.map(toIReleaseFlagDecision)
  }

  findAllForTrackedFlag = async (trackedFlagId: string, tx: TxClient): Promise<IReleaseFlagDecision[]> => {
    const rows = await tx.releaseFlagDecision.findMany({ where: { trackedFlagId } })
    return rows.map(toIReleaseFlagDecision)
  }

  upsertByReleaseAndFlag = async (
    data: ICreateReleaseFlagDecisionData,
    tx: TxClient,
  ): Promise<IReleaseFlagDecision> => {
    const row = await tx.releaseFlagDecision.upsert({
      where: { releaseId_trackedFlagId: { releaseId: data.releaseId, trackedFlagId: data.trackedFlagId } },
      update: { decision: data.decision, decidedById: data.decidedById, decidedAt: data.decidedAt },
      create: {
        releaseId: data.releaseId,
        trackedFlagId: data.trackedFlagId,
        decision: data.decision,
        decidedById: data.decidedById,
        decidedAt: data.decidedAt,
      },
    })
    return toIReleaseFlagDecision(row)
  }

  findLatestInProgressForProject = async (
    projectId: string,
    excludeReleaseId: string | null,
    tx: TxClient,
  ): Promise<ILatestInProgressFlagDecision[]> => {
    const decisions = await tx.releaseFlagDecision.findMany({
      where: { trackedFlag: { projectId, deletedAt: null, presentInCode: true } },
      orderBy: { updatedAt: 'desc' },
      select: {
        releaseId: true,
        decision: true,
        decidedAt: true,
        trackedFlag: { select: { id: true, key: true, featureId: true } },
      },
    })

    const excludedFlagIds = new Set(
      excludeReleaseId === null
        ? []
        : decisions.filter((decision) => decision.releaseId === excludeReleaseId).map((d) => d.trackedFlag.id),
    )

    const seenFlagIds = new Set<string>()
    const latestByFlag = new Map<string, ILatestInProgressFlagDecision>()
    for (const decision of decisions) {
      if (excludedFlagIds.has(decision.trackedFlag.id)) continue
      if (seenFlagIds.has(decision.trackedFlag.id)) continue
      seenFlagIds.add(decision.trackedFlag.id)
      if (decision.decision !== ReleaseFlagDecisionType.in_progress) continue

      latestByFlag.set(decision.trackedFlag.id, {
        trackedFlagId: decision.trackedFlag.id,
        key: decision.trackedFlag.key,
        featureId: decision.trackedFlag.featureId,
        releaseId: decision.releaseId,
        decidedAt: decision.decidedAt,
      })
    }

    return [...latestByFlag.values()]
  }

  findLatestDecisionsForProject = async (
    projectId: string,
    excludeReleaseId: string | null,
    tx: TxClient,
  ): Promise<ILatestFlagDecisionForProject[]> => {
    const decisions = await tx.releaseFlagDecision.findMany({
      where: {
        trackedFlag: { projectId, deletedAt: null, presentInCode: true },
        release: { deletedAt: null },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        releaseId: true,
        decision: true,
        decidedAt: true,
        trackedFlag: {
          select: { id: true, key: true, featureId: true, feature: { select: { name: true } } },
        },
      },
    })

    const excludedFlagIds = new Set(
      excludeReleaseId === null
        ? []
        : decisions
            .filter((decision) => decision.releaseId === excludeReleaseId)
            .map((decision) => decision.trackedFlag.id),
    )

    const latestByFlag = new Map<string, ILatestFlagDecisionForProject>()
    for (const decision of decisions) {
      const flag = decision.trackedFlag
      if (excludedFlagIds.has(flag.id)) continue
      if (latestByFlag.has(flag.id)) continue

      latestByFlag.set(flag.id, {
        trackedFlagId: flag.id,
        key: flag.key,
        featureId: flag.featureId,
        featureName: flag.feature?.name ?? null,
        releaseId: decision.releaseId,
        decision: decision.decision,
        decidedAt: decision.decidedAt,
      })
    }

    return [...latestByFlag.values()]
  }

  findActiveEnableDecisionForFlag = async (
    projectId: string,
    key: string,
    tx: TxClient,
  ): Promise<IActiveEnableDecisionForFlag | null> => {
    const trackedFlag = await tx.trackedFlag.findFirst({
      where: { projectId, key, deletedAt: null },
      select: { id: true },
    })
    if (!trackedFlag) return null

    const decision = await tx.releaseFlagDecision.findFirst({
      where: {
        trackedFlagId: trackedFlag.id,
        decision: ReleaseFlagDecisionType.ENABLE_IN_RELEASE,
        release: { status: { in: [ReleaseStatus.merged, ReleaseStatus.deployed] } },
      },
      orderBy: { decidedAt: 'desc' },
      select: { releaseId: true, release: { select: { name: true, compareRef: true } } },
    })
    if (!decision) return null

    return {
      trackedFlagId: trackedFlag.id,
      releaseId: decision.releaseId,
      releaseName: decision.release.name ?? decision.release.compareRef,
    }
  }

  findLatestForTrackedFlag = async (trackedFlagId: string, tx: TxClient): Promise<IReleaseFlagDecision | null> => {
    const row = await tx.releaseFlagDecision.findFirst({
      where: { trackedFlagId },
      orderBy: { updatedAt: 'desc' },
    })
    if (!row) return null
    return toIReleaseFlagDecision(row)
  }
}
