import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { NotificationPreferenceEntryType } from '../types/notification-preference.type'
import { NotificationsPageType } from '../types/notifications-page.type'
import { NotificationsPageInput } from '../types/notifications-page.input'
import { GetNotificationPreferencesQuery } from '../queries/get-notification-preferences/get-notification-preferences.query'
import { GetNotificationsPageQuery } from '../queries/get-notifications-page/get-notifications-page.query'
import { GetUnreadNotificationsCountQuery } from '../queries/get-unread-notifications-count/get-unread-notifications-count.query'
import { UpdateNotificationPreferenceInput } from '../commands/update-notification-preference/update-notification-preference.input'
import { UpdateNotificationPreferenceCommand } from '../commands/update-notification-preference/update-notification-preference.command'
import { TriggerFlagDigestCommand } from '../commands/trigger-flag-digest/trigger-flag-digest.command'
import { MarkNotificationReadCommand } from '../commands/mark-notification-read/mark-notification-read.command'
import { MarkAllNotificationsReadCommand } from '../commands/mark-all-notifications-read/mark-all-notifications-read.command'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class NotificationsResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [NotificationPreferenceEntryType])
  @Can(Action.READ, Subject.PROJECT)
  notificationPreferences(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<NotificationPreferenceEntryType[]> {
    return this.queryBus.execute(new GetNotificationPreferencesQuery(projectId, user.id))
  }

  @Mutation(() => NotificationPreferenceEntryType)
  @Can(Action.READ, Subject.PROJECT)
  updateNotificationPreference(
    @Args('input', { type: () => UpdateNotificationPreferenceInput }) input: UpdateNotificationPreferenceInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<NotificationPreferenceEntryType> {
    return this.commandBus.execute(
      new UpdateNotificationPreferenceCommand(
        input.projectId,
        user.id,
        input.notificationType,
        input.channel,
        input.enabled,
        input.digestFrequency ?? null,
      ),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.PROJECT)
  triggerFlagDigest(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new TriggerFlagDigestCommand(projectId, user.id))
  }

  @Query(() => NotificationsPageType)
  @Can(Action.READ, Subject.USER)
  notifications(
    @Args('input', { type: () => NotificationsPageInput }) input: NotificationsPageInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<NotificationsPageType> {
    return this.queryBus.execute(
      new GetNotificationsPageQuery(user.id, input.limit ?? 20, input.offset ?? 0, input.projectId),
    )
  }

  @Query(() => Int)
  @Can(Action.READ, Subject.USER)
  unreadNotificationsCount(@CurrentUser() user: IJwtUser): Promise<number> {
    return this.queryBus.execute(new GetUnreadNotificationsCountQuery(user.id))
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.USER)
  markNotificationRead(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, user.id))
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.USER)
  markAllNotificationsRead(@CurrentUser() user: IJwtUser): Promise<boolean> {
    return this.commandBus.execute(new MarkAllNotificationsReadCommand(user.id))
  }
}
