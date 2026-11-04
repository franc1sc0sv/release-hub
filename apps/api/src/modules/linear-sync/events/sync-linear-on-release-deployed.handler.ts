import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import type { ReleaseDeployedEvent } from '../../release/events/release-deployed.event'
import { SyncLinearCommand } from '../commands/sync-linear/sync-linear.command'

@Injectable()
export class SyncLinearOnReleaseDeployedHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: ILogger,
  ) {}

  @OnEvent('release.deployed')
  async onReleaseDeployed(event: ReleaseDeployedEvent): Promise<void> {
    try {
      await this.commandBus.execute(new SyncLinearCommand(event.projectId, event.releaseId, null, null))
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
