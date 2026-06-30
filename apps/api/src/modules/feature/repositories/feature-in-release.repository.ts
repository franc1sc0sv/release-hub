import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IFeatureInReleaseRepository } from '../interfaces/feature-in-release.repository'
import type { IFeatureInRelease, IFlagState } from '../interfaces/feature.interfaces'
import { FeatureState } from '../../../common/types/feature-state.enum'

@Injectable()
export class FeatureInReleaseRepository extends IFeatureInReleaseRepository {
  findById = async (id: string, tx: TxClient): Promise<IFeatureInRelease | null> => {
    const row = await tx.featureInRelease.findFirst({ where: { id } })
    if (!row) return null
    return this.toIFeatureInRelease(row)
  }

  findByFeatureAndRelease = async (
    featureId: string,
    releaseId: string,
    tx: TxClient,
  ): Promise<IFeatureInRelease | null> => {
    const row = await tx.featureInRelease.findFirst({ where: { featureId, releaseId } })
    if (!row) return null
    return this.toIFeatureInRelease(row)
  }

  findByFeature = async (featureId: string, tx: TxClient): Promise<IFeatureInRelease[]> => {
    const rows = await tx.featureInRelease.findMany({
      where: { featureId, release: { deletedAt: null } },
    })
    return rows.map((row) => this.toIFeatureInRelease(row))
  }

  upsertState = async (
    featureId: string,
    releaseId: string,
    state: FeatureState,
    tx: TxClient,
  ): Promise<IFeatureInRelease> => {
    const row = await tx.featureInRelease.upsert({
      where: { featureId_releaseId: { featureId, releaseId } },
      create: { featureId, releaseId, state },
      update: { state },
    })
    return this.toIFeatureInRelease(row)
  }

  private toIFeatureInRelease(row: {
    id: string
    featureId: string
    releaseId: string
    state: string
    flagStaging: boolean | null
    flagProduction: boolean | null
    updatedAt: Date
  }): IFeatureInRelease {
    const flagState: IFlagState | null =
      row.flagStaging !== null && row.flagProduction !== null
        ? { staging: row.flagStaging, production: row.flagProduction }
        : null

    return {
      id: row.id,
      featureId: row.featureId,
      releaseId: row.releaseId,
      state: row.state as FeatureState,
      flagState,
      updatedAt: row.updatedAt,
    }
  }
}
