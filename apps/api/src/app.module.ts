import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CqrsModule } from '@nestjs/cqrs'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { join } from 'path'
import { validateEnv } from './common/config/env.validation'
import { HealthModule } from './modules/health/health.module'
import { LoggingModule } from './common/logging/logging.module'
import { LoggingInterceptor } from './common/logging/logging.interceptor'
import { DatabaseModule } from './common/database/database.module'
import { EventModule } from './common/events/event.module'
import { MailModule } from './common/mail/mail.module'
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard'
import { AuthModule } from './modules/auth/auth.module'
import { OrganizationModule } from './modules/organization/organization.module'
import { ProjectModule } from './modules/project/project.module'
import { ReleaseModule } from './modules/release/release.module'
import { FeatureModule } from './modules/feature/feature.module'
import { AiModule } from './modules/ai/ai.module'
import { CollaborationModule } from './modules/collaboration/collaboration.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { ProjectTagModule } from './modules/project-tag/project-tag.module'
import { SummaryProfileModule } from './modules/summary-profile/summary-profile.module'
import { GithubAuthModule } from './modules/github-auth/github-auth.module'
import { GithubAppModule } from './modules/github-app/github-app.module'
import { LinearAuthModule } from './modules/linear-auth/linear-auth.module'
import { FlagTrackingModule } from './modules/flag-tracking/flag-tracking.module'
import { WebhooksModule } from './modules/webhooks/webhooks.module'
import { SlackAuthModule } from './modules/slack-auth/slack-auth.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { RepoOpsModule } from './modules/repo-ops/repo-ops.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: true,
      validate: validateEnv,
    }),
    LoggingModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: (ctx: {
        req?: { headers?: Record<string, string> }
        res?: unknown
        connectionParams?: { authorization?: string }
        extra?: { request?: { headers: Record<string, string> } }
      }) => {
        const upgradeRequest = ctx.extra?.request
        const authorization = ctx.connectionParams?.authorization
        if (upgradeRequest && authorization) {
          upgradeRequest.headers = {
            ...upgradeRequest.headers,
            authorization,
          }
        }
        return {
          req: ctx.req ?? upgradeRequest,
          res: ctx.res,
        }
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    DatabaseModule,
    EventModule,
    MailModule,
    AuthModule,
    OrganizationModule,
    ProjectModule,
    ReleaseModule,
    FeatureModule,
    AiModule,
    CollaborationModule,
    IntegrationModule,
    ProjectTagModule,
    SummaryProfileModule,
    GithubAuthModule,
    GithubAppModule,
    LinearAuthModule,
    FlagTrackingModule,
    WebhooksModule,
    SlackAuthModule,
    NotificationsModule,
    RepoOpsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
