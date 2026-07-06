import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { IntegrationModule } from '../integration/integration.module'
import { OrganizationModule } from '../organization/organization.module'
import { ProjectModule } from '../project/project.module'
import { GithubAuthResolver } from './resolvers/github-auth.resolver'
import { CreateGithubBranchHandler } from './commands/create-github-branch/create-github-branch.handler'
import { ListGithubBranchesHandler } from './queries/list-github-branches/list-github-branches.handler'
import { SearchGithubBranchesHandler } from './queries/search-github-branches/search-github-branches.handler'
import { CompareRefsHandler } from './queries/compare-refs/compare-refs.handler'

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    IntegrationModule,
    OrganizationModule,
    ProjectModule,
  ],
  providers: [
    GithubAuthResolver,
    CreateGithubBranchHandler,
    ListGithubBranchesHandler,
    SearchGithubBranchesHandler,
    CompareRefsHandler,
  ],
})
export class GithubAuthModule {}
