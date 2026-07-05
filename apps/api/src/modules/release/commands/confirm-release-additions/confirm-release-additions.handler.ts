import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { IFeatureRepository } from '../../../feature/interfaces/feature.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { ConfirmReleaseAdditionsCommand } from './confirm-release-additions.command'

@CommandHandler(ConfirmReleaseAdditionsCommand)
export class ConfirmReleaseAdditionsHandler extends BaseCommandHandler<
  ConfirmReleaseAdditionsCommand,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ConfirmReleaseAdditionsCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: command.userId,
        projectId: release.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const pendingPrs = await this.pullRequestRepository.findPendingAdditionsByRelease(
      command.releaseId,
      tx,
    )

    if (pendingPrs.length === 0) {
      return toReleaseObjectType(release)
    }

    const unassigned = pendingPrs.filter((pr) => pr.featureId === null)
    if (unassigned.length > 0) {
      throw new AppException(
        `All pending pull requests must be assigned to a feature before confirming: ${unassigned
          .map((pr) => `#${pr.number}`)
          .join(', ')}`,
        ErrorCode.VALIDATION_ERROR,
      )
    }

    const pendingFeatureIds = [...new Set(pendingPrs.map((pr) => pr.featureId as string))]
    const suggestedFeatures = await this.featureRepository.findSuggestedByIds(pendingFeatureIds, tx)

    for (const feature of suggestedFeatures) {
      await this.featureRepository.acceptSuggested(feature.id, {}, tx)
    }

    for (const featureId of pendingFeatureIds) {
      const feature = await this.featureRepository.findById(featureId, tx)
      if (!feature) continue
      await this.featureInReleaseRepository.upsertState(
        featureId,
        command.releaseId,
        feature.state,
        tx,
      )
    }

    for (const pr of pendingPrs) {
      await this.pullRequestRepository.clearPendingAddition(pr.id, tx)
    }

    return toReleaseObjectType(release)
  }
}
