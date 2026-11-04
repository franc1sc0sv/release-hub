import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ILinearSyncActionRepository } from '../interfaces/linear-sync-action.repository'
import type { ILinearSyncAction, IUpsertLinearSyncActionData } from '../interfaces/linear-sync.interfaces'

@Injectable()
export class LinearSyncActionRepository extends ILinearSyncActionRepository {
  findByDedupeKey = async (projectId: string, dedupeKey: string, tx: TxClient): Promise<ILinearSyncAction | null> =>
    tx.linearSyncAction.findUnique({ where: { projectId_dedupeKey: { projectId, dedupeKey } } })

  findAllForRelease = async (releaseId: string, tx: TxClient): Promise<ILinearSyncAction[]> =>
    tx.linearSyncAction.findMany({
      where: { releaseId },
      orderBy: [{ kind: 'asc' }, { issueIdentifier: 'asc' }],
    })

  upsert = async (data: IUpsertLinearSyncActionData, tx: TxClient): Promise<ILinearSyncAction> =>
    tx.linearSyncAction.upsert({
      where: { projectId_dedupeKey: { projectId: data.projectId, dedupeKey: data.dedupeKey } },
      create: data,
      update: {
        releaseId: data.releaseId ?? undefined,
        status: data.status,
        signature: data.signature,
        detail: data.detail,
      },
    })
}
