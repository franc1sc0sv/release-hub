import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagHistoryEventType, FlagHistorySource, ReleaseFlagDecisionType } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { FlagClosedReason } from '../../../../common/types/flag-closed-reason.enum'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../interfaces/flag-history.repository'
import { CloseAbandonedReleaseFlagsCommand } from './close-abandoned-release-flags.command'

@CommandHandler(CloseAbandonedReleaseFlagsCommand)
export class CloseAbandonedReleaseFlagsHandler extends BaseCommandHandler<CloseAbandonedReleaseFlagsCommand, number> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly releaseRepository: IReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: CloseAbandonedReleaseFlagsCommand, tx: TxClient): Promise<number> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    const decisions = await this.releaseFlagDecisionRepository.findAllForRelease(release.id, tx)
    const abandonedDecisions = decisions.filter(
      (decision) => decision.decision === ReleaseFlagDecisionType.abandoned,
    )

    const historyRows: ICreateFlagHistoryEventData[] = []
    for (const decision of abandonedDecisions) {
      const trackedFlag = await this.trackedFlagRepository.findById(decision.trackedFlagId, tx)
      if (!trackedFlag || trackedFlag.closedAt !== null) continue

      await this.trackedFlagRepository.setClosure(
        trackedFlag.id,
        { closedAt: new Date(), closedReason: FlagClosedReason.ABANDONED, closedById: decision.decidedById },
        tx,
      )
      historyRows.push({
        projectId: release.projectId,
        flagKey: trackedFlag.key,
        trackedFlagId: trackedFlag.id,
        releaseId: release.id,
        actorId: decision.decidedById,
        type: FlagHistoryEventType.flag_closed,
        source: FlagHistorySource.system,
      })
    }

    await this.flagHistoryRepository.createMany(historyRows, tx)
    return historyRows.length
  }
}
