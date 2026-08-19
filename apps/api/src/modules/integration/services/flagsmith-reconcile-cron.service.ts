import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CommandBus } from '@nestjs/cqrs'
import { FlagsmithSyncSource } from '@release-hub/db'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { IProjectRepository } from '../../project/interfaces/project.repository'
import { SyncFlagsmithFlagsCommand } from '../commands/sync-flagsmith-flags/sync-flagsmith-flags.command'

const RECONCILE_JOB_NAME = 'flagsmith-nightly-reconcile'

@Injectable()
export class FlagsmithReconcileCronService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly commandBus: CommandBus,
    private readonly logger: ILogger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async reconcileAllProjects(): Promise<void> {
    const projects = await this.db.$query((tx) => this.projectRepository.findAll(tx))

    for (const project of projects) {
      if (!project.flagsmithEnabled) continue

      try {
        await this.commandBus.execute(
          new SyncFlagsmithFlagsCommand(project.id, null, FlagsmithSyncSource.scheduled),
        )
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: RECONCILE_JOB_NAME,
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }
    }
  }
}
