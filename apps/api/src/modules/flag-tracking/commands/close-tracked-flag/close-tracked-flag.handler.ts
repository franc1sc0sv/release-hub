import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import { TrackedFlagClosureType } from '../../types/tracked-flag-closure.type'
import { toTrackedFlagClosureType } from '../../types/tracked-flag-closure.mapper'
import { CloseTrackedFlagCommand } from './close-tracked-flag.command'

@CommandHandler(CloseTrackedFlagCommand)
export class CloseTrackedFlagHandler extends BaseCommandHandler<CloseTrackedFlagCommand, TrackedFlagClosureType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: CloseTrackedFlagCommand, tx: TxClient): Promise<TrackedFlagClosureType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: command.projectId, action: Action.UPDATE, subjectKind: Subject.RELEASE },
      tx,
    )

    const trackedFlag = await this.trackedFlagRepository.findByProjectAndKey(command.projectId, command.key, tx)
    if (!trackedFlag) throw new NotFoundException('TrackedFlag')
    if (trackedFlag.closedAt !== null) {
      throw new AppException('This flag is already closed.', ErrorCode.CONFLICT)
    }

    const closed = await this.trackedFlagRepository.setClosure(
      trackedFlag.id,
      { closedAt: new Date(), closedReason: command.reason, closedById: command.userId },
      tx,
    )

    await this.flagHistoryRepository.createMany(
      [
        {
          projectId: command.projectId,
          flagKey: trackedFlag.key,
          trackedFlagId: trackedFlag.id,
          actorId: command.userId,
          type: FlagHistoryEventType.flag_closed,
          source: FlagHistorySource.user,
        },
      ],
      tx,
    )

    return toTrackedFlagClosureType(closed)
  }
}
