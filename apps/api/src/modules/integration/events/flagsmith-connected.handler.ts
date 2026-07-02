import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CommandBus } from '@nestjs/cqrs'
import { FlagsmithSyncSource } from '@release-hub/db'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { SyncFlagsmithFlagsCommand } from '../commands/sync-flagsmith-flags/sync-flagsmith-flags.command'
import type { FlagsmithConnectedEvent } from './flagsmith-connected.event'

@Injectable()
export class FlagsmithConnectedHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: ILogger,
  ) {}

  @OnEvent('flagsmith.connected')
  async onFlagsmithConnected(event: FlagsmithConnectedEvent): Promise<void> {
    try {
      await this.commandBus.execute(
        new SyncFlagsmithFlagsCommand(event.projectId, null, FlagsmithSyncSource.initial),
      )
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.FLAGSMITH_SYNC_FAILED,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.FLAGSMITH_SYNC_FAILED,
      )
    }
  }
}
