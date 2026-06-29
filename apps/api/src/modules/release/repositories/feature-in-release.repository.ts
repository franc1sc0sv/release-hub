import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IFeatureInReleaseRepository } from '../interfaces/feature-in-release.repository'
import type { IFeatureInRelease, IFlagState } from '../../feature/interfaces/feature.interfaces'
import { FeatureState } from '../../../common/types/feature-state.enum'

@Injectable()
export class FeatureInReleaseRepository extends IFeatureInReleaseRepository {
  findByRelease = async (releaseId: string, tx: TxClient): Promise<IFeatureInRelease[]> => {
    const rows = await tx.featureInRelease.findMany({
      where: { releaseId, release: { deletedAt: null } },
    })
    return rows.map((row) => this.toIFeatureInRelease(row))
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
