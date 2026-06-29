import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ILinearConnectionRepository } from '../interfaces/linear-connection.repository'
import type { IProjectLinearConnection, IUpsertProjectLinearConnectionData } from '../interfaces/linear-connection.interfaces'

@Injectable()
export class LinearConnectionRepository extends ILinearConnectionRepository {
  upsertForProject = async (
    data: IUpsertProjectLinearConnectionData,
    tx: TxClient,
  ): Promise<IProjectLinearConnection> => {
    const row = await tx.projectLinearConnection.upsert({
      where: { projectId: data.projectId },
      create: {
        projectId: data.projectId,
        accessToken: data.encryptedAccessToken,
        refreshToken: data.encryptedRefreshToken,
        expiresAt: data.expiresAt,
        linearUserId: data.linearUserId,
        linearUserName: data.linearUserName,
        scopes: data.scopes,
      },
      update: {
        accessToken: data.encryptedAccessToken,
        refreshToken: data.encryptedRefreshToken,
        expiresAt: data.expiresAt,
        linearUserId: data.linearUserId,
        linearUserName: data.linearUserName,
        scopes: data.scopes,
      },
    })
    return this.toInterface(row)
  }

  findByProject = async (projectId: string, tx: TxClient): Promise<IProjectLinearConnection | null> => {
    const row = await tx.projectLinearConnection.findUnique({ where: { projectId } })
    if (!row) return null
    return this.toInterface(row)
  }

  deleteByProject = async (projectId: string, tx: TxClient): Promise<void> => {
    await tx.projectLinearConnection.deleteMany({ where: { projectId } })
  }

  private toInterface(row: {
    id: string
    projectId: string
    accessToken: string
    refreshToken: string | null
    expiresAt: Date | null
    linearUserId: string
    linearUserName: string
    scopes: string | null
    createdAt: Date
    updatedAt: Date
  }): IProjectLinearConnection {
    return {
      id: row.id,
      projectId: row.projectId,
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      expiresAt: row.expiresAt,
      linearUserId: row.linearUserId,
      linearUserName: row.linearUserName,
      scopes: row.scopes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
