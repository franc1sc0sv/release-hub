import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagHistoryEventType, FlagHistorySource, ReleaseFlagDecisionType } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import { ReleaseFlagDecisionResultType } from '../../types/release-flag-decision.type'
import { SetReleaseFlagDecisionCommand } from './set-release-flag-decision.command'

type IFlagHistoryEventType = (typeof FlagHistoryEventType)[keyof typeof FlagHistoryEventType]

const DECISION_HISTORY_EVENT_TYPE: Record<ReleaseFlagDecisionType, IFlagHistoryEventType> = {
  [ReleaseFlagDecisionType.ENABLE_IN_RELEASE]: FlagHistoryEventType.decision_enable_in_release,
  [ReleaseFlagDecisionType.SHIP_OFF]: FlagHistoryEventType.decision_ship_off,
  [ReleaseFlagDecisionType.in_progress]: FlagHistoryEventType.decision_in_progress,
}

@CommandHandler(SetReleaseFlagDecisionCommand)
export class SetReleaseFlagDecisionHandler extends BaseCommandHandler<
  SetReleaseFlagDecisionCommand,
  ReleaseFlagDecisionResultType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetReleaseFlagDecisionCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ReleaseFlagDecisionResultType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const trackedFlag = await this.trackedFlagRepository.findById(command.trackedFlagId, tx)
    if (!trackedFlag) throw new NotFoundException('TrackedFlag')

    const decision = await this.releaseFlagDecisionRepository.upsertByReleaseAndFlag(
      {
        releaseId: command.releaseId,
        trackedFlagId: command.trackedFlagId,
        decision: command.decision,
        decidedById: command.userId,
        decidedAt: new Date(),
      },
      tx,
    )

    await this.flagHistoryRepository.create(
      {
        projectId: release.projectId,
        flagKey: trackedFlag.key,
        trackedFlagId: trackedFlag.id,
        releaseId: release.id,
        actorId: command.userId,
        type: DECISION_HISTORY_EVENT_TYPE[command.decision],
        source: FlagHistorySource.user,
      },
      tx,
    )

    const result = new ReleaseFlagDecisionResultType()
    result.id = decision.id
    result.releaseId = decision.releaseId
    result.trackedFlagId = decision.trackedFlagId
    result.decision = decision.decision
    result.decidedById = decision.decidedById
    result.decidedAt = decision.decidedAt
    return result
  }
}
