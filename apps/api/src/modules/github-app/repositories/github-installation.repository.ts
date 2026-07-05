import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { GithubInstallationStatus } from '@release-hub/db'
import { IGithubInstallationRepository } from '../interfaces/github-installation.repository'
import type {
  IGithubInstallation,
  IUpsertGithubInstallationData,
  IInstallationRepoInput,
} from '../interfaces/github-installation.interfaces'

interface IGithubInstallationRow {
  id: string
  installationId: bigint
  organizationId: string | null
  accountLogin: string
  accountType: string
  accountId: bigint
  repositorySelection: string
  status: GithubInstallationStatus
}

@Injectable()
export class GithubInstallationRepository extends IGithubInstallationRepository {
  upsertByInstallationId = async (
    data: IUpsertGithubInstallationData,
    tx: TxClient,
  ): Promise<{ id: string }> => {
    const existing = await tx.githubInstallation.findUnique({
      where: { installationId: BigInt(data.installationId) },
      select: { organizationId: true },
    })
    const organizationId = existing?.organizationId ?? data.organizationId

    const row = await tx.githubInstallation.upsert({
      where: { installationId: BigInt(data.installationId) },
      create: {
        installationId: BigInt(data.installationId),
        organizationId,
        accountLogin: data.accountLogin,
        accountType: data.accountType,
        accountId: BigInt(data.accountId),
        repositorySelection: data.repositorySelection,
        status: data.status,
      },
      update: {
        organizationId,
        accountLogin: data.accountLogin,
        accountType: data.accountType,
        accountId: BigInt(data.accountId),
        repositorySelection: data.repositorySelection,
        status: data.status,
      },
      select: { id: true },
    })
    return { id: row.id }
  }

  findByInstallationId = async (
    installationId: number,
    tx: TxClient,
  ): Promise<IGithubInstallation | null> => {
    const row = await tx.githubInstallation.findUnique({
      where: { installationId: BigInt(installationId) },
    })
    return row ? this.toIGithubInstallation(row) : null
  }

  findActiveByOrganizationId = async (
    organizationId: string,
    tx: TxClient,
  ): Promise<IGithubInstallation | null> => {
    const row = await tx.githubInstallation.findFirst({
      where: { organizationId, status: GithubInstallationStatus.active },
      orderBy: { createdAt: 'desc' },
    })
    return row ? this.toIGithubInstallation(row) : null
  }

  linkOrganization = async (
    installationId: number,
    organizationId: string,
    tx: TxClient,
  ): Promise<void> => {
    await tx.githubInstallation.update({
      where: { installationId: BigInt(installationId) },
      data: { organizationId },
    })
  }

  setStatus = async (
    installationId: number,
    status: GithubInstallationStatus,
    tx: TxClient,
  ): Promise<void> => {
    await tx.githubInstallation.update({
      where: { installationId: BigInt(installationId) },
      data: {
        status,
        suspendedAt: status === GithubInstallationStatus.suspended ? new Date() : null,
      },
    })
  }

  replaceRepositories = async (
    installationRowId: string,
    repos: IInstallationRepoInput[],
    tx: TxClient,
  ): Promise<void> => {
    await tx.githubInstallationRepo.deleteMany({ where: { installationRowId } })
    if (repos.length === 0) return
    await tx.githubInstallationRepo.createMany({
      data: repos.map((repo) => ({
        installationRowId,
        repoId: BigInt(repo.repoId),
        fullName: repo.fullName,
        private: repo.private,
      })),
    })
  }

  private toIGithubInstallation(row: IGithubInstallationRow): IGithubInstallation {
    return {
      id: row.id,
      installationId: Number(row.installationId),
      organizationId: row.organizationId,
      accountLogin: row.accountLogin,
      accountType: row.accountType,
      accountId: Number(row.accountId),
      repositorySelection: row.repositorySelection,
      status: row.status,
    }
  }
}
