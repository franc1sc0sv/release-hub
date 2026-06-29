import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CqrsModule } from '@nestjs/cqrs'
import { ThrottlerModule } from '@nestjs/throttler'
import { join } from 'path'
import { LoggingModule } from './common/logging/logging.module'
import { LoggingInterceptor } from './common/logging/logging.interceptor'
import { DatabaseModule } from './common/database/database.module'
import { EventModule } from './common/events/event.module'
import { MailModule } from './common/mail/mail.module'
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard'
import { AuthModule } from './modules/auth/auth.module'
import { ProjectModule } from './modules/project/project.module'
import { ReleaseModule } from './modules/release/release.module'
import { FeatureModule } from './modules/feature/feature.module'
import { AiModule } from './modules/ai/ai.module'
import { CollaborationModule } from './modules/collaboration/collaboration.module'
import { IntegrationModule } from './modules/integration/integration.module'
import { ProjectTagModule } from './modules/project-tag/project-tag.module'
import { GithubAuthModule } from './modules/github-auth/github-auth.module'
import { LinearAuthModule } from './modules/linear-auth/linear-auth.module'

@Module({
  imports: [
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
    CqrsModule.forRoot(),
    DatabaseModule,
    EventModule,
    MailModule,
    AuthModule,
    ProjectModule,
    ReleaseModule,
    FeatureModule,
    AiModule,
    CollaborationModule,
    IntegrationModule,
    ProjectTagModule,
    GithubAuthModule,
    LinearAuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
