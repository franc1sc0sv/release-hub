import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { ReleaseModule } from '../release/release.module'
import { NotificationsResolver } from './resolvers/notifications.resolver'
import { INotificationPreferenceRepository } from './interfaces/notification-preference.repository'
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository'
import { INotificationReadRepository } from './interfaces/notification-read.repository'
import { NotificationReadRepository } from './repositories/notification-read.repository'
import { EmailNotificationProvider } from './providers/email-notification.provider'
import { SlackDmProvider } from './providers/slack-dm.provider'
import { SlackChannelProvider } from './providers/slack-channel.provider'
import { NotificationDispatcherService } from './services/notification-dispatcher.service'
import { FlagDigestService } from './services/flag-digest.service'
import { FlagStalenessService } from './services/flag-staleness.service'
import { NotificationCronService } from './services/notification-cron.service'
import { GetNotificationPreferencesHandler } from './queries/get-notification-preferences/get-notification-preferences.handler'
import { UpdateNotificationPreferenceHandler } from './commands/update-notification-preference/update-notification-preference.handler'
import { TriggerFlagDigestHandler } from './commands/trigger-flag-digest/trigger-flag-digest.handler'
import { NotificationReleaseCreatedHandler } from './events/release-created.handler'
import { NotificationReleaseShippedHandler } from './events/release-shipped.handler'
import { NotificationReleaseDeployedHandler } from './events/release-deployed.handler'

@Module({
  imports: [CqrsModule, ProjectModule, ReleaseModule],
  providers: [
    NotificationsResolver,
    { provide: INotificationPreferenceRepository, useClass: NotificationPreferenceRepository },
    { provide: INotificationReadRepository, useClass: NotificationReadRepository },
    EmailNotificationProvider,
    SlackDmProvider,
    SlackChannelProvider,
    NotificationDispatcherService,
    FlagDigestService,
    FlagStalenessService,
    NotificationCronService,
    GetNotificationPreferencesHandler,
    UpdateNotificationPreferenceHandler,
    TriggerFlagDigestHandler,
    NotificationReleaseCreatedHandler,
    NotificationReleaseShippedHandler,
    NotificationReleaseDeployedHandler,
  ],
})
export class NotificationsModule {}
