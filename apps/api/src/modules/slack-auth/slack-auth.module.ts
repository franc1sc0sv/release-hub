import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { ProjectModule } from '../project/project.module'
import { ISlackConnectionRepository } from './interfaces/slack-connection.repository'
import { SlackConnectionRepository } from './repositories/slack-connection.repository'
import { ISlackApiClient } from './interfaces/slack-api-client'
import { SlackApiClient } from './clients/slack-api-client'
import { SlackAuthResolver } from './resolvers/slack-auth.resolver'
import { SlackAuthController } from './controllers/slack-auth.controller'
import { ConnectSlackHandler } from './commands/connect-slack/connect-slack.handler'
import { DisconnectSlackHandler } from './commands/disconnect-slack/disconnect-slack.handler'
import { UpdateSlackNotificationSettingsHandler } from './commands/update-slack-notification-settings/update-slack-notification-settings.handler'
import { SetSlackChannelHandler } from './commands/set-slack-channel/set-slack-channel.handler'
import { SendSlackTestMessageHandler } from './commands/send-slack-test-message/send-slack-test-message.handler'
import { GetSlackConnectionHandler } from './queries/get-slack-connection/get-slack-connection.handler'
import { CheckSlackAuthorizeHandler } from './queries/check-slack-authorize/check-slack-authorize.handler'
import { ListSlackChannelsHandler } from './queries/list-slack-channels/list-slack-channels.handler'

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    ProjectModule,
  ],
  controllers: [SlackAuthController],
  providers: [
    SlackAuthResolver,
    { provide: ISlackConnectionRepository, useClass: SlackConnectionRepository },
    { provide: ISlackApiClient, useClass: SlackApiClient },
    ConnectSlackHandler,
    DisconnectSlackHandler,
    UpdateSlackNotificationSettingsHandler,
    SetSlackChannelHandler,
    SendSlackTestMessageHandler,
    GetSlackConnectionHandler,
    CheckSlackAuthorizeHandler,
    ListSlackChannelsHandler,
  ],
  exports: [ISlackConnectionRepository, ISlackApiClient],
})
export class SlackAuthModule {}
