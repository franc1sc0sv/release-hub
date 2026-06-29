import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ICommitRepository } from '../interfaces/commit.repository'
import type { ICommit, ICreateCommitData } from '../interfaces/release.interfaces'

@Injectable()
export class CommitRepository extends ICommitRepository {
  findById = async (id: string, tx: TxClient): Promise<ICommit | null> => {
    const row = await tx.commit.findFirst({ where: { id } })
    if (!row) return null
    return this.toICommit(row)
  }

  upsert = async (data: ICreateCommitData, tx: TxClient): Promise<ICommit> => {
    const row = await tx.commit.upsert({
      where: {
        pullRequestId_sha: {
          pullRequestId: data.pullRequestId,
          sha: data.sha,
        },
      },
      update: {
        message: data.message,
        author: data.author,
        committedAt: data.committedAt,
      },
      create: {
        pullRequestId: data.pullRequestId,
        sha: data.sha,
        message: data.message,
        author: data.author,
        committedAt: data.committedAt,
      },
    })
    return this.toICommit(row)
  }

  private toICommit(row: {
    id: string
    pullRequestId: string
    sha: string
    message: string
    author: string
    committedAt: Date
  }): ICommit {
    return {
      id: row.id,
      pullRequestId: row.pullRequestId,
      sha: row.sha,
      message: row.message,
      author: row.author,
      committedAt: row.committedAt,
    }
  }
}
