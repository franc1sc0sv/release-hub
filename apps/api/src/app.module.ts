import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CqrsModule } from '@nestjs/cqrs'
import { join } from 'path'
import { DatabaseModule } from './common/database/database.module'
import { EventModule } from './common/events/event.module'
import { MailModule } from './common/mail/mail.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    CqrsModule.forRoot(),
    DatabaseModule,
    EventModule,
    MailModule,
    AuthModule,
  ],
})
export class AppModule {}
