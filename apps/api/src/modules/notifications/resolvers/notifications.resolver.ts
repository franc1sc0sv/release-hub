import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { NotificationPreferenceEntryType } from '../types/notification-preference.type'
import { GetNotificationPreferencesQuery } from '../queries/get-notification-preferences/get-notification-preferences.query'
import { UpdateNotificationPreferenceInput } from '../commands/update-notification-preference/update-notification-preference.input'
import { UpdateNotificationPreferenceCommand } from '../commands/update-notification-preference/update-notification-preference.command'
import { TriggerFlagDigestCommand } from '../commands/trigger-flag-digest/trigger-flag-digest.command'

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
}
