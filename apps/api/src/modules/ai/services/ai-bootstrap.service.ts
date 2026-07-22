import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { AiSummaryStatus } from '../../../common/types/ai-summary-status.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'

@Injectable()
export class AiBootstrapService implements OnApplicationBootstrap {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.sweepDraftStatus()
    await this.sweepSummaryStatus()
  }

  private async sweepDraftStatus(): Promise<void> {
    const ids = await this.db.$transaction((tx) =>
      this.releaseRepository.findIdsByAiDraftStatus(AiDraftStatus.RUNNING, tx),
    )

    if (ids.length === 0) return

    await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatusBulk(ids, AiDraftStatus.FAILED, tx),
    )

    this.logger.info(
      {
        event: LogEvent.AI_DRAFT_ORPHAN_SWEEP,
        count: ids.length,
        releaseIds: ids,
      },
      LogEvent.AI_DRAFT_ORPHAN_SWEEP,
    )
  }

  private async sweepSummaryStatus(): Promise<void> {
    const ids = await this.db.$transaction((tx) =>
      this.releaseRepository.findIdsBySummaryStatus(AiSummaryStatus.GENERATING, tx),
    )

    if (ids.length === 0) return

    await this.db.$transaction((tx) =>
      this.releaseRepository.updateSummaryStatusBulk(ids, AiSummaryStatus.FAILED, tx),
    )

    this.logger.info(
      {
        event: LogEvent.AI_SUMMARY_ORPHAN_SWEEP,
        count: ids.length,
        releaseIds: ids,
      },
      LogEvent.AI_SUMMARY_ORPHAN_SWEEP,
    )
  }
}
