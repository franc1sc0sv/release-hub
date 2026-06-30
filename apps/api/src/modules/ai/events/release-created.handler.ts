import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { AiDraftRunner } from '../services/ai-draft-runner.service'
import type { ReleaseCreatedEvent } from '../../release/events/release-created.event'

@Injectable()
export class AiDraftReleaseCreatedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly draftRunner: AiDraftRunner,
  ) {}

  @OnEvent('release.created')
  async onReleaseCreated(event: ReleaseCreatedEvent): Promise<void> {
    try {
      await this.draftRunner.run(event.releaseId, event.projectId, { resume: false })
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.AI_DRAFT_FAILED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.AI_DRAFT_FAILED,
      )
      await this.db.$transaction((tx) =>
        this.releaseRepository.updateAiDraftStatus(event.releaseId, AiDraftStatus.FAILED, tx),
      )
    }
  }
}
