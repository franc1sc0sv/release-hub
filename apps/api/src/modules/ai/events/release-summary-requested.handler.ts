import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { AiSummaryStatus } from '../../../common/types/ai-summary-status.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { AiSummaryRunner } from '../services/ai-summary-runner.service'
import type { ReleaseSummaryRequestedEvent } from './release-summary-requested.event'

@Injectable()
export class AiSummaryReleaseRequestedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly summaryRunner: AiSummaryRunner,
  ) {}

  @OnEvent('release.summary.requested')
  async onReleaseSummaryRequested(event: ReleaseSummaryRequestedEvent): Promise<void> {
    try {
      await this.summaryRunner.run(event.releaseId, {
        model: event.model,
        summaryProfileId: event.summaryProfileId,
        featureIds: event.featureIds,
      })
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.AI_SUMMARY_FAILED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.AI_SUMMARY_FAILED,
      )
      await this.db.$transaction((tx) =>
        this.releaseRepository.updateSummaryStatus(event.releaseId, AiSummaryStatus.FAILED, tx),
      )
    }
  }
}
