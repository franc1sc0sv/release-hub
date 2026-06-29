import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { ProjectModule } from '../project/project.module'
import { ILinearConnectionRepository } from './interfaces/linear-connection.repository'
import { LinearConnectionRepository } from './repositories/linear-connection.repository'
import { LinearAuthResolver } from './resolvers/linear-auth.resolver'
import { LinearAuthController } from './controllers/linear-auth.controller'
import { ConnectLinearHandler } from './commands/connect-linear/connect-linear.handler'
import { DisconnectLinearHandler } from './commands/disconnect-linear/disconnect-linear.handler'
import { GetLinearConnectionHandler } from './queries/get-linear-connection/get-linear-connection.handler'
import { CheckLinearAuthorizeHandler } from './queries/check-linear-authorize/check-linear-authorize.handler'

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    ProjectModule,
  ],
  controllers: [LinearAuthController],
  providers: [
    LinearAuthResolver,
    { provide: ILinearConnectionRepository, useClass: LinearConnectionRepository },
    ConnectLinearHandler,
    DisconnectLinearHandler,
    GetLinearConnectionHandler,
    CheckLinearAuthorizeHandler,
  ],
  exports: [ILinearConnectionRepository],
})
export class LinearAuthModule {}
