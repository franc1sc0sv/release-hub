import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { RejectSuggestedFeatureCommand } from './reject-suggested-feature.command'

@CommandHandler(RejectSuggestedFeatureCommand)
export class RejectSuggestedFeatureHandler extends BaseCommandHandler<RejectSuggestedFeatureCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RejectSuggestedFeatureCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<boolean> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    if (!feature.suggested) {
      throw new AppException(
        'Feature is not a suggested feature',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.FEATURE,
        __type: Subject.FEATURE,
        projectId: feature.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    await this.pullRequestRepository.clearFeatureAssignment(command.featureId, tx)
    await this.featureRepository.softDelete(command.featureId, tx)

    void events

    return true
  }
}
