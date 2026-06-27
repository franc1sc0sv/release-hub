import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CqrsModule } from '@nestjs/cqrs'
import { ThrottlerModule } from '@nestjs/throttler'
import { join } from 'path'
import { DatabaseModule } from './common/database/database.module'
import { EventModule } from './common/events/event.module'
import { MailModule } from './common/mail/mail.module'
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req }: { req: unknown }) => ({ req }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    CqrsModule.forRoot(),
    DatabaseModule,
    EventModule,
    MailModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: GqlThrottlerGuard }],
})
export class AppModule {}
