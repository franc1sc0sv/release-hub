import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { IntegrationModule } from '../integration/integration.module'
import { ProjectModule } from '../project/project.module'
import { IGithubConnectionRepository } from './interfaces/github-connection.repository'
import { GithubConnectionRepository } from './repositories/github-connection.repository'
import { GithubAuthResolver } from './resolvers/github-auth.resolver'
import { GithubAuthController } from './controllers/github-auth.controller'
import { ConnectGithubHandler } from './commands/connect-github/connect-github.handler'
import { DisconnectGithubHandler } from './commands/disconnect-github/disconnect-github.handler'
import { ReauthorizeGithubHandler } from './commands/reauthorize-github/reauthorize-github.handler'
import { CreateGithubBranchHandler } from './commands/create-github-branch/create-github-branch.handler'
import { GetGithubConnectionHandler } from './queries/get-github-connection/get-github-connection.handler'
import { ListGithubRepositoriesHandler } from './queries/list-github-repositories/list-github-repositories.handler'
import { ListGithubBranchesHandler } from './queries/list-github-branches/list-github-branches.handler'
import { CompareRefsHandler } from './queries/compare-refs/compare-refs.handler'

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    IntegrationModule,
    ProjectModule,
  ],
  controllers: [GithubAuthController],
  providers: [
    GithubAuthResolver,
    { provide: IGithubConnectionRepository, useClass: GithubConnectionRepository },
    ConnectGithubHandler,
    DisconnectGithubHandler,
    ReauthorizeGithubHandler,
    CreateGithubBranchHandler,
    GetGithubConnectionHandler,
    ListGithubRepositoriesHandler,
    ListGithubBranchesHandler,
    CompareRefsHandler,
  ],
  exports: [IGithubConnectionRepository],
})
export class GithubAuthModule {}
