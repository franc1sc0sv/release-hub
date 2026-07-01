import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import type { ReleaseFlagDecisionType } from '@release-hub/db'
import {
  IReleaseFlagDecisionRepository,
} from '../interfaces/release-flag-decision.repository'
import type { ICreateReleaseFlagDecisionData, IReleaseFlagDecision } from '../interfaces/flag-tracking.interfaces'

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
}
