import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { IProjectRepository } from '../../project/interfaces/project.repository'
import { ScanReleasePullRequestsCommand } from '../commands/scan-release-pull-requests/scan-release-pull-requests.command'
import type { ReleaseCreatedEvent } from '../../release/events/release-created.event'

@Injectable()
export class ScanFlagsOnReleaseCreatedHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly commandBus: CommandBus,
    private readonly projectRepository: IProjectRepository,
  ) {}

  @OnEvent('release.created')
  async onReleaseCreated(event: ReleaseCreatedEvent): Promise<void> {
    const config = await this.db.$query((tx) =>
      this.projectRepository.findFlagRegistryConfig(event.projectId, tx),
    )

    if (!config?.flagRegistryPath) return

    try {
      await this.commandBus.execute(
        new ScanReleasePullRequestsCommand(event.releaseId, event.actorId),
      )
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.FLAG_SCAN_FAILED,
          releaseId: event.releaseId,
          projectId: event.projectId,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.FLAG_SCAN_FAILED,
      )
    }
  }
}
