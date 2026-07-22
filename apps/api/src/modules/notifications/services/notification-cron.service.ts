import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { DigestFrequency } from '../../../common/types/digest-frequency.enum'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { FlagStalenessService } from './flag-staleness.service'
import { FlagDigestService } from './flag-digest.service'
import { FlagShipOffReminderService } from './flag-ship-off-reminder.service'
import { FlagEnableOffConflictService } from './flag-enable-off-conflict.service'

const WEEKLY_DIGEST_CRON = '0 8 * * 1'

@Injectable()
export class NotificationCronService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly flagStalenessService: FlagStalenessService,
    private readonly flagDigestService: FlagDigestService,
    private readonly flagShipOffReminderService: FlagShipOffReminderService,
    private readonly flagEnableOffConflictService: FlagEnableOffConflictService,
    private readonly logger: ILogger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runDailyJobs(): Promise<void> {
    const projects = await this.db.$transaction((tx) => this.notificationReadRepository.findAllActiveProjects(tx))

    for (const project of projects) {
      try {
        await this.flagStalenessService.runStalenessScanForProject(project)
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: 'flag-staleness-scan',
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }

      try {
        await this.flagDigestService.sendDigestForProject(project, DigestFrequency.DAILY)
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: 'flag-digest-daily',
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }

      try {
        await this.flagShipOffReminderService.runShipOffReminderScanForProject(project)
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: 'flag-ship-off-reminder',
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }

      try {
        await this.flagEnableOffConflictService.runConflictScanForProject(project)
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: 'flag-enable-off-conflict',
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }
    }
  }

  @Cron(WEEKLY_DIGEST_CRON)
  async runWeeklyJobs(): Promise<void> {
    const projects = await this.db.$transaction((tx) => this.notificationReadRepository.findAllActiveProjects(tx))

    for (const project of projects) {
      try {
        await this.flagDigestService.sendDigestForProject(project, DigestFrequency.WEEKLY)
      } catch (error) {
        this.logger.error(
          {
            event: LogEvent.OPERATION_ERROR,
            job: 'flag-digest-weekly',
            projectId: project.id,
            err: error instanceof Error ? error.message : String(error),
          },
          LogEvent.OPERATION_ERROR,
        )
      }
    }
  }
}
