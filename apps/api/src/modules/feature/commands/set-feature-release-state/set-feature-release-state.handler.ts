import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../../common/types/feature-timeline.enum'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
import { IFeatureStateEventRepository } from '../../interfaces/feature-state-event.repository'
import { FeatureInReleaseType } from '../../types/feature-in-release.type'
import { toFeatureInReleaseType } from '../../types/feature.mappers'
import { assertFeatureStateEditable } from '../../types/feature-state.rules'
import { FeatureStateChangedEvent } from '../../events/feature-state-changed.event'
import { SetFeatureReleaseStateCommand } from './set-feature-release-state.command'

@CommandHandler(SetFeatureReleaseStateCommand)
export class SetFeatureReleaseStateHandler extends BaseCommandHandler<
  SetFeatureReleaseStateCommand,
  FeatureInReleaseType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly featureStateEventRepository: IFeatureStateEventRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetFeatureReleaseStateCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<FeatureInReleaseType> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (release.projectId !== feature.projectId) {
      throw new AppException(
        'The feature and the release belong to different projects',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: feature.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.FEATURE,
      },
      tx,
    )

    assertFeatureStateEditable(feature)

    const existing = await this.featureInReleaseRepository.findByFeatureAndRelease(
      command.featureId,
      command.releaseId,
      tx,
    )

    const updated = await this.featureInReleaseRepository.upsertState(
      command.featureId,
      command.releaseId,
      command.state,
      tx,
    )

    if (existing?.state !== command.state) {
      await this.featureStateEventRepository.create(
        {
          featureId: command.featureId,
          releaseId: command.releaseId,
          scope: FeatureTimelineScope.RELEASE,
          source: command.flagKey
            ? FeatureTimelineSource.FLAG_DECISION
            : FeatureTimelineSource.USER,
          fromState: existing?.state ?? null,
          toState: command.state,
          actorId: command.userId,
          flagKey: command.flagKey,
        },
        tx,
      )
    }

    events.push(new FeatureStateChangedEvent(command.featureId, command.state))

    return toFeatureInReleaseType(updated)
  }
}
