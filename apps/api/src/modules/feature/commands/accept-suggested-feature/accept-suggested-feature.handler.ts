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
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeatureType } from '../../types/feature.type'
import { toFeatureType } from '../../types/feature.mappers'
import { AcceptSuggestedFeatureCommand } from './accept-suggested-feature.command'

@CommandHandler(AcceptSuggestedFeatureCommand)
export class AcceptSuggestedFeatureHandler extends BaseCommandHandler<AcceptSuggestedFeatureCommand, FeatureType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: AcceptSuggestedFeatureCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<FeatureType> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    if (!feature.suggested) {
      throw new AppException(
        'Feature is not a suggested feature',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    await authorizeProjectAction(
      this.orgRepository,
      { actorId: command.userId, projectId: feature.projectId, action: Action.UPDATE, subjectKind: Subject.FEATURE },
      tx,
    )

    const overrides: Partial<Pick<typeof feature, 'name' | 'description' | 'tags'>> = {}
    if (command.name !== null) overrides.name = command.name
    if (command.description !== null) overrides.description = command.description
    if (command.tags !== null) overrides.tags = command.tags

    const updated = await this.featureRepository.acceptSuggested(command.featureId, overrides, tx)

    void events

    return toFeatureType(updated)
  }
}
