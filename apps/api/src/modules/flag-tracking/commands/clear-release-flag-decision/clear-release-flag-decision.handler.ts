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
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { ClearReleaseFlagDecisionCommand } from './clear-release-flag-decision.command'

@CommandHandler(ClearReleaseFlagDecisionCommand)
export class ClearReleaseFlagDecisionHandler extends BaseCommandHandler<ClearReleaseFlagDecisionCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: ClearReleaseFlagDecisionCommand, tx: TxClient): Promise<boolean> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: release.projectId, action: Action.UPDATE, subjectKind: Subject.RELEASE },
      tx,
    )

    const trackedFlag = await this.trackedFlagRepository.findById(command.trackedFlagId, tx)
    if (!trackedFlag) throw new NotFoundException('TrackedFlag')
    if (trackedFlag.closedAt !== null) {
      throw new AppException('This flag is closed. Reopen it on the Flags page first.', ErrorCode.CONFLICT)
    }

    await this.releaseFlagDecisionRepository.deleteByReleaseAndFlag(command.releaseId, command.trackedFlagId, tx)
    return true
  }
}
