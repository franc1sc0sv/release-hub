import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ILinearOAuthStateRepository } from '../interfaces/linear-oauth-state.repository'
import type {
  ILinearOAuthState,
  ICreateLinearOAuthStateData,
} from '../interfaces/linear-oauth-state.interfaces'

@Injectable()
export class LinearOAuthStateRepository extends ILinearOAuthStateRepository {
  create = async (data: ICreateLinearOAuthStateData, tx: TxClient): Promise<void> => {
    await tx.linearOAuthState.create({
      data: {
        nonce: data.nonce,
        userId: data.userId,
        projectId: data.projectId,
        expiresAt: data.expiresAt,
      },
    })
  }

  consume = async (nonce: string, tx: TxClient): Promise<ILinearOAuthState | null> => {
    const now = new Date()
    const updated = await tx.linearOAuthState.updateMany({
      where: { nonce, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    })
    if (updated.count === 0) return null

    const row = await tx.linearOAuthState.findUnique({ where: { nonce } })
    if (!row) return null

    return {
      id: row.id,
      nonce: row.nonce,
      userId: row.userId,
      projectId: row.projectId,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
    }
  }
}
