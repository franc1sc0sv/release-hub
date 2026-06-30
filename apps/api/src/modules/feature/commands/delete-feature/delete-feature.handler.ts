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
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { DeleteFeatureCommand } from './delete-feature.command'

@CommandHandler(DeleteFeatureCommand)
export class DeleteFeatureHandler extends BaseCommandHandler<DeleteFeatureCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DeleteFeatureCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<boolean> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.DELETE, {
        kind: Subject.FEATURE,
        __type: Subject.FEATURE,
        projectId: feature.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const activeReleases = await this.featureRepository.findReleasesForFeature(command.featureId, tx)

    if (activeReleases.some((release) => release.status === ReleaseStatus.DEPLOYED)) {
      throw new AppException(
        'Feature is part of a deployed release and cannot be deleted.',
        ErrorCode.CONFLICT,
      )
    }

    if (activeReleases.length > 0) {
      throw new AppException(
        'Feature is used by an active release. Delete the release first.',
        ErrorCode.CONFLICT,
      )
    }

    await this.featureRepository.softDelete(command.featureId, tx)

    void events

    return true
  }
}
