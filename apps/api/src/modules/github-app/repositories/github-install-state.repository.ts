import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IGithubInstallStateRepository } from '../interfaces/github-install-state.repository'
import type {
  IGithubInstallState,
  ICreateGithubInstallStateData,
} from '../interfaces/github-install-state.interfaces'

@Injectable()
export class GithubInstallStateRepository extends IGithubInstallStateRepository {
  create = async (data: ICreateGithubInstallStateData, tx: TxClient): Promise<void> => {
    await tx.githubInstallState.create({
      data: {
        nonce: data.nonce,
        organizationId: data.organizationId,
        projectId: data.projectId,
        expiresAt: data.expiresAt,
      },
    })
  }

  consume = async (nonce: string, tx: TxClient): Promise<IGithubInstallState | null> => {
    const now = new Date()
    const updated = await tx.githubInstallState.updateMany({
      where: { nonce, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    })
    if (updated.count === 0) return null

    const row = await tx.githubInstallState.findUnique({ where: { nonce } })
    if (!row) return null

    return {
      id: row.id,
      nonce: row.nonce,
      organizationId: row.organizationId,
      projectId: row.projectId,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
    }
  }
}
