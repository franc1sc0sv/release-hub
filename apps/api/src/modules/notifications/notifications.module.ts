import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { OrganizationModule } from '../organization/organization.module'
import { ReleaseModule } from '../release/release.module'
import { FlagHistoryModule } from '../flag-tracking/flag-history.module'
import { NotificationsResolver } from './resolvers/notifications.resolver'
import { INotificationPreferenceRepository } from './interfaces/notification-preference.repository'
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository'
import { INotificationReadRepository } from './interfaces/notification-read.repository'
import { NotificationReadRepository } from './repositories/notification-read.repository'
import { INotificationRepository } from './interfaces/notification.repository'
import { NotificationRepository } from './repositories/notification.repository'
import { EmailNotificationProvider } from './providers/email-notification.provider'
import { SlackDmProvider } from './providers/slack-dm.provider'
import { SlackChannelProvider } from './providers/slack-channel.provider'
import { NotificationDispatcherService } from './services/notification-dispatcher.service'
import { FlagDigestService } from './services/flag-digest.service'
import { FlagStalenessService } from './services/flag-staleness.service'
import { FlagShipOffReminderService } from './services/flag-ship-off-reminder.service'
import { FlagEnableOffConflictService } from './services/flag-enable-off-conflict.service'
import { NotificationCronService } from './services/notification-cron.service'
import { GetNotificationPreferencesHandler } from './queries/get-notification-preferences/get-notification-preferences.handler'
import { GetNotificationsPageHandler } from './queries/get-notifications-page/get-notifications-page.handler'
import { GetUnreadNotificationsCountHandler } from './queries/get-unread-notifications-count/get-unread-notifications-count.handler'
import { UpdateNotificationPreferenceHandler } from './commands/update-notification-preference/update-notification-preference.handler'
import { TriggerFlagDigestHandler } from './commands/trigger-flag-digest/trigger-flag-digest.handler'
import { MarkNotificationReadHandler } from './commands/mark-notification-read/mark-notification-read.handler'
import { MarkAllNotificationsReadHandler } from './commands/mark-all-notifications-read/mark-all-notifications-read.handler'
import { NotificationReleaseCreatedHandler } from './events/release-created.handler'
import { NotificationReleaseShippedHandler } from './events/release-shipped.handler'
import { NotificationReleaseDeployedHandler } from './events/release-deployed.handler'
import { NotificationFlagWebhookTransitionHandler } from './events/flag-webhook-transition.handler'
import { NotificationFlagConflictDetectedHandler } from './events/flag-conflict-detected.handler'

@Module({
  imports: [CqrsModule, OrganizationModule, ReleaseModule, FlagHistoryModule],
  providers: [
    NotificationsResolver,
    { provide: INotificationPreferenceRepository, useClass: NotificationPreferenceRepository },
    { provide: INotificationReadRepository, useClass: NotificationReadRepository },
    { provide: INotificationRepository, useClass: NotificationRepository },
    EmailNotificationProvider,
    SlackDmProvider,
    SlackChannelProvider,
    NotificationDispatcherService,
    FlagDigestService,
    FlagStalenessService,
    FlagShipOffReminderService,
    FlagEnableOffConflictService,
    NotificationCronService,
    GetNotificationPreferencesHandler,
    GetNotificationsPageHandler,
    GetUnreadNotificationsCountHandler,
    UpdateNotificationPreferenceHandler,
    TriggerFlagDigestHandler,
    MarkNotificationReadHandler,
    MarkAllNotificationsReadHandler,
    NotificationReleaseCreatedHandler,
    NotificationReleaseShippedHandler,
    NotificationReleaseDeployedHandler,
    NotificationFlagWebhookTransitionHandler,
    NotificationFlagConflictDetectedHandler,
  ],
})
export class NotificationsModule {}
