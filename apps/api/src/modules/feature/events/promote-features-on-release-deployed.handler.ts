import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { TxClient } from '@release-hub/db'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { FeatureKind } from '../../../common/types/feature-kind.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'
import {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../common/types/feature-timeline.enum'
import type { ReleaseDeployedEvent } from '../../release/events/release-deployed.event'
import { IFeatureRepository } from '../interfaces/feature.repository'
import { IFeatureInReleaseRepository } from '../interfaces/feature-in-release.repository'
import { IFeatureStateEventRepository } from '../interfaces/feature-state-event.repository'

const PROMOTABLE_STATE = FeatureState.READY_TO_RELEASE
const PROMOTED_STATE = FeatureState.FULLY_RELEASED

@Injectable()
export class PromoteFeaturesOnReleaseDeployedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly featureStateEventRepository: IFeatureStateEventRepository,
  ) {}

  @OnEvent('release.deployed')
  async onReleaseDeployed(event: ReleaseDeployedEvent): Promise<void> {
    try {
      await this.db.$transaction((tx) => this.promoteReadyFeatures(event.releaseId, tx))
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }

  private async promoteReadyFeatures(releaseId: string, tx: TxClient): Promise<void> {
    const ledger = await this.featureInReleaseRepository.findByRelease(releaseId, tx)

    for (const entry of ledger) {
      if (entry.state !== PROMOTABLE_STATE) continue

      const feature = await this.featureRepository.findById(entry.featureId, tx)
      if (!feature || feature.kind !== FeatureKind.PRODUCT) continue
      if (feature.state === FeatureState.COMPLETED) continue

      await this.featureInReleaseRepository.upsertState(
        entry.featureId,
        releaseId,
        PROMOTED_STATE,
        tx,
      )
      await this.featureStateEventRepository.create(
        {
          featureId: entry.featureId,
          releaseId,
          scope: FeatureTimelineScope.RELEASE,
          source: FeatureTimelineSource.SYSTEM,
          fromState: entry.state,
          toState: PROMOTED_STATE,
          actorId: null,
          flagKey: null,
        },
        tx,
      )

      if (feature.state === PROMOTED_STATE) continue

      await this.featureRepository.updateState(feature.id, PROMOTED_STATE, tx)
      await this.featureStateEventRepository.create(
        {
          featureId: feature.id,
          releaseId,
          scope: FeatureTimelineScope.FEATURE,
          source: FeatureTimelineSource.SYSTEM,
          fromState: feature.state,
          toState: PROMOTED_STATE,
          actorId: null,
          flagKey: null,
        },
        tx,
      )
    }
  }
}
