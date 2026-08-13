import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { IFeatureStateEventRepository } from '../../interfaces/feature-state-event.repository'
import { FeatureType } from '../../types/feature.type'
import { toFeatureType } from '../../types/feature.mappers'
import { assertFeatureStateEditable } from '../../types/feature-state.rules'
import {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../../common/types/feature-timeline.enum'
import { FeatureStateChangedEvent } from '../../events/feature-state-changed.event'
import { SetFeatureStateCommand } from './set-feature-state.command'

@CommandHandler(SetFeatureStateCommand)
export class SetFeatureStateHandler extends BaseCommandHandler<SetFeatureStateCommand, FeatureType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureStateEventRepository: IFeatureStateEventRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetFeatureStateCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<FeatureType> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    await authorizeProjectAction(
      this.orgRepository,
      { actorId: command.userId, projectId: feature.projectId, action: Action.UPDATE, subjectKind: Subject.FEATURE },
      tx,
    )

    assertFeatureStateEditable(feature)

    const updated = await this.featureRepository.updateState(command.featureId, command.state, tx)

    if (feature.state !== command.state) {
      await this.featureStateEventRepository.create(
        {
          featureId: command.featureId,
          releaseId: null,
          scope: FeatureTimelineScope.FEATURE,
          source: FeatureTimelineSource.USER,
          fromState: feature.state,
          toState: command.state,
          actorId: command.userId,
          flagKey: null,
        },
        tx,
      )
    }

    events.push(new FeatureStateChangedEvent(command.featureId, command.state))

    return toFeatureType(updated)
  }
}
