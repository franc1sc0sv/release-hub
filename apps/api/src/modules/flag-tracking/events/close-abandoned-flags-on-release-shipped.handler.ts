import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { CloseAbandonedReleaseFlagsCommand } from '../commands/close-abandoned-release-flags/close-abandoned-release-flags.command'
import type { ReleaseShippedEvent } from '../../release/events/release-shipped.event'

@Injectable()
export class CloseAbandonedFlagsOnReleaseShippedHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly commandBus: CommandBus,
  ) {}

  @OnEvent('release.shipped')
  async onReleaseShipped(event: ReleaseShippedEvent): Promise<void> {
    try {
      await this.commandBus.execute(new CloseAbandonedReleaseFlagsCommand(event.releaseId))
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.FLAG_CLOSE_ABANDONED_FAILED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.FLAG_CLOSE_ABANDONED_FAILED,
      )
    }
  }
}
