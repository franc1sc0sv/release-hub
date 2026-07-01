import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import {
  IFlagBranchPresenceRepository,
  type IUpsertFlagBranchPresenceData,
} from '../interfaces/flag-branch-presence.repository'
import type { IFlagBranchPresence } from '../interfaces/flag-tracking.interfaces'

interface IFlagBranchPresenceRow {
  id: string
  trackedFlagId: string
  branch: string
  present: boolean
  headSha: string | null
  firstSeenAt: Date
  lastConfirmedAt: Date
}

function toIFlagBranchPresence(row: IFlagBranchPresenceRow): IFlagBranchPresence {
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
export class FlagBranchPresenceRepository extends IFlagBranchPresenceRepository {
  findById = async (id: string, tx: TxClient): Promise<IFlagBranchPresence | null> => {
    const row = await tx.flagBranchPresence.findFirst({ where: { id } })
    if (!row) return null
    return toIFlagBranchPresence(row)
  }

  upsertPresence = async (data: IUpsertFlagBranchPresenceData, tx: TxClient): Promise<IFlagBranchPresence> => {
    const row = await tx.flagBranchPresence.upsert({
      where: { trackedFlagId_branch: { trackedFlagId: data.trackedFlagId, branch: data.branch } },
      update: { present: data.present, headSha: data.headSha, lastConfirmedAt: new Date() },
      create: {
        trackedFlagId: data.trackedFlagId,
        branch: data.branch,
        present: data.present,
        headSha: data.headSha,
      },
    })
    return toIFlagBranchPresence(row)
  }

  markAbsentForMissingBranches = async (
    trackedFlagId: string,
    presentBranches: string[],
    tx: TxClient,
  ): Promise<void> => {
    await tx.flagBranchPresence.updateMany({
      where: { trackedFlagId, branch: { notIn: presentBranches } },
      data: { present: false },
    })
  }

  findAllForTrackedFlag = async (trackedFlagId: string, tx: TxClient): Promise<IFlagBranchPresence[]> => {
    const rows = await tx.flagBranchPresence.findMany({ where: { trackedFlagId } })
    return rows.map(toIFlagBranchPresence)
  }
}
