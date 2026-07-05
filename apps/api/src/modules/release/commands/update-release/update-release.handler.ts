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
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { UpdateReleaseCommand } from './update-release.command'

@CommandHandler(UpdateReleaseCommand)
export class UpdateReleaseHandler extends BaseCommandHandler<UpdateReleaseCommand, ReleaseObjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateReleaseCommand,
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

    const isDraft = release.status === ReleaseStatus.DRAFT

    if (!isDraft && command.tags !== undefined) {
      throw new AppException('Only draft releases can be updated', ErrorCode.VALIDATION_ERROR)
    }

    let updated = release

    if (command.tags !== undefined) {
      updated = await this.releaseRepository.update(command.releaseId, { tags: command.tags }, tx)
    }

    if (command.prAssignments?.length) {
      for (const assignment of command.prAssignments) {
        if (!assignment.featureId) continue

        if (!isDraft) {
          const pr = await this.pullRequestRepository.findById(assignment.pullRequestId, tx)
          if (!pr || !pr.pendingAddition) {
            throw new AppException(
              'Only pending-addition pull requests can be assigned on a non-draft release',
              ErrorCode.VALIDATION_ERROR,
            )
          }
        }

        await this.pullRequestRepository.assignToFeature(assignment.pullRequestId, assignment.featureId, tx)
      }
    }

    return toReleaseObjectType(updated)
  }
}
