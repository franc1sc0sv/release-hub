import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import {
  IBlockedBranchRepository,
  type IBlockedBranch,
  type ICreateBlockedBranchData,
} from '../interfaces/blocked-branch.repository'

@Injectable()
export class BlockedBranchRepository extends IBlockedBranchRepository {
  findById = async (id: string, tx: TxClient): Promise<IBlockedBranch | null> => {
    const row = await tx.blockedBranch.findUnique({ where: { id } })
    return row ? this.toIBlockedBranch(row) : null
  }

  findAllByProject = async (projectId: string, tx: TxClient): Promise<IBlockedBranch[]> => {
    const rows = await tx.blockedBranch.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toIBlockedBranch(row))
  }

  findByProjectAndBranch = async (
    projectId: string,
    branchName: string,
    tx: TxClient,
  ): Promise<IBlockedBranch | null> => {
    const row = await tx.blockedBranch.findUnique({
      where: { projectId_branchName: { projectId, branchName } },
    })
    return row ? this.toIBlockedBranch(row) : null
  }

  create = async (data: ICreateBlockedBranchData, tx: TxClient): Promise<IBlockedBranch> => {
    const row = await tx.blockedBranch.create({
      data: {
        projectId: data.projectId,
        branchName: data.branchName,
        reason: data.reason,
        createdById: data.createdById,
      },
    })
    return this.toIBlockedBranch(row)
  }

  deleteByProjectAndBranch = async (
    projectId: string,
    branchName: string,
    tx: TxClient,
  ): Promise<void> => {
    await tx.blockedBranch.delete({
      where: { projectId_branchName: { projectId, branchName } },
    })
  }

  private toIBlockedBranch(row: {
    id: string
    projectId: string
    branchName: string
    reason: string | null
    createdById: string
    createdAt: Date
  }): IBlockedBranch {
    return {
      id: row.id,
      projectId: row.projectId,
      branchName: row.branchName,
      reason: row.reason,
      createdById: row.createdById,
      createdAt: row.createdAt,
    }
  }
}
