import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IGithubConnectionRepository } from '../interfaces/github-connection.repository'
import type { IGithubConnection, IUpsertGithubConnectionData } from '../interfaces/github-connection.interfaces'

@Injectable()
export class GithubConnectionRepository extends IGithubConnectionRepository {
  upsertForUser = async (
    data: IUpsertGithubConnectionData,
    tx: TxClient,
  ): Promise<IGithubConnection> => {
    const row = await tx.githubConnection.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        accessToken: data.encryptedAccessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        githubUserId: data.githubUserId,
        githubLogin: data.githubLogin,
        scopes: data.scopes,
      },
      update: {
        accessToken: data.encryptedAccessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        githubUserId: data.githubUserId,
        githubLogin: data.githubLogin,
        scopes: data.scopes,
      },
    })
    return this.toInterface(row)
  }

  findByUserId = async (userId: string, tx: TxClient): Promise<IGithubConnection | null> => {
    const row = await tx.githubConnection.findUnique({ where: { userId } })
    if (!row) return null
    return this.toInterface(row)
  }

  deleteByUserId = async (userId: string, tx: TxClient): Promise<void> => {
    await tx.githubConnection.deleteMany({ where: { userId } })
  }

  private toInterface(row: {
    id: string
    userId: string
    accessToken: string
    refreshToken: string | null
    expiresAt: Date | null
    githubUserId: string
    githubLogin: string
    scopes: string | null
    createdAt: Date
    updatedAt: Date
  }): IGithubConnection {
    return {
      id: row.id,
      userId: row.userId,
      accessToken: row.accessToken,
      refreshToken: row.refreshToken,
      expiresAt: row.expiresAt,
      githubUserId: row.githubUserId,
      githubLogin: row.githubLogin,
      scopes: row.scopes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
