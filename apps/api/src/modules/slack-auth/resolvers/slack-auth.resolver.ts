import { Args, ID, Mutation, Query, Resolver, Context } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import type { Response } from 'express'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { SlackConnectionStatus } from '../types/slack-connection-status.type'
import { SlackChannel } from '../types/slack-channel.type'
import { SlackTestMessageResult } from '../types/slack-test-message-result.type'
import { GetSlackConnectionQuery } from '../queries/get-slack-connection/get-slack-connection.query'
import { CheckSlackAuthorizeQuery } from '../queries/check-slack-authorize/check-slack-authorize.query'
import { ListSlackChannelsQuery } from '../queries/list-slack-channels/list-slack-channels.query'
import { DisconnectSlackCommand } from '../commands/disconnect-slack/disconnect-slack.command'
import { UpdateSlackNotificationSettingsCommand } from '../commands/update-slack-notification-settings/update-slack-notification-settings.command'
import { SetSlackChannelCommand } from '../commands/set-slack-channel/set-slack-channel.command'
import { SendSlackTestMessageCommand } from '../commands/send-slack-test-message/send-slack-test-message.command'

interface IGqlContext {
  res: Response
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class SlackAuthResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => String)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  async slackAuthorizeUrl(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
    @Context() ctx: IGqlContext,
  ): Promise<string> {
    await this.queryBus.execute(new CheckSlackAuthorizeQuery(projectId, user.id))

    const clientId = process.env.SLACK_CLIENT_ID!
    const callbackUrl =
      process.env.SLACK_CALLBACK_URL ?? 'http://localhost:3001/auth/slack/callback'

    const stateValue = randomBytes(32).toString('base64url')
    const signedState = this.jwtService.sign(
      { sub: user.id, projectId, nonce: stateValue },
      { expiresIn: '10m' },
    )

    ctx.res.cookie('slack_oauth_state', stateValue, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 600_000,
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'chat:write,channels:read,users:read,users:read.email,im:write',
      state: signedState,
    })

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`
  }

  @Query(() => SlackConnectionStatus)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  slackConnection(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SlackConnectionStatus> {
    return this.queryBus.execute(new GetSlackConnectionQuery(projectId, user.id))
  }

  @Query(() => [SlackChannel])
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  slackChannels(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SlackChannel[]> {
    return this.queryBus.execute(new ListSlackChannelsQuery(projectId, user.id))
  }

  @Mutation(() => Boolean)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  disconnectSlack(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DisconnectSlackCommand(projectId, user.id))
  }

  @Mutation(() => SlackConnectionStatus)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  updateSlackNotificationSettings(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('notifyOnCreated') notifyOnCreated: boolean,
    @Args('notifyOnShipped') notifyOnShipped: boolean,
    @Args('notifyOnDeployed') notifyOnDeployed: boolean,
    @CurrentUser() user: IJwtUser,
  ): Promise<SlackConnectionStatus> {
    return this.commandBus.execute(
      new UpdateSlackNotificationSettingsCommand(
        projectId,
        user.id,
        notifyOnCreated,
        notifyOnShipped,
        notifyOnDeployed,
      ),
    )
  }

  @Mutation(() => SlackConnectionStatus)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  setSlackChannel(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('channelId') channelId: string,
    @Args('channelName') channelName: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SlackConnectionStatus> {
    return this.commandBus.execute(new SetSlackChannelCommand(projectId, user.id, channelId, channelName))
  }

  @Mutation(() => SlackTestMessageResult)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PROJECT)
  sendSlackTestMessage(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SlackTestMessageResult> {
    return this.commandBus.execute(new SendSlackTestMessageCommand(projectId, user.id))
  }
}
