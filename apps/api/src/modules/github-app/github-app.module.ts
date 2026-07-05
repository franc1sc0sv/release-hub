import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { JwtModule } from '@nestjs/jwt'
import { IntegrationModule } from '../integration/integration.module'
import { ProjectModule } from '../project/project.module'
import { OrganizationModule } from '../organization/organization.module'
import { GithubAppResolver } from './resolvers/github-app.resolver'
import { GithubAppSetupController } from './controllers/github-app-setup.controller'
import { IGithubInstallationRepository } from './interfaces/github-installation.repository'
import { GithubInstallationRepository } from './repositories/github-installation.repository'
import { IGithubInstallStateRepository } from './interfaces/github-install-state.repository'
import { GithubInstallStateRepository } from './repositories/github-install-state.repository'
import { CreateGithubInstallStateHandler } from './commands/create-github-install-state/create-github-install-state.handler'
import { LinkGithubInstallationHandler } from './commands/link-github-installation/link-github-installation.handler'
import { CompleteGithubInstallationHandler } from './commands/complete-github-installation/complete-github-installation.handler'
import { ReconcileGithubInstallationHandler } from './commands/reconcile-github-installation/reconcile-github-installation.handler'
import { GetInstallationRepositoriesHandler } from './queries/get-installation-repositories/get-installation-repositories.handler'

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
    IntegrationModule,
    ProjectModule,
    OrganizationModule,
  ],
  controllers: [GithubAppSetupController],
  providers: [
    GithubAppResolver,
    { provide: IGithubInstallationRepository, useClass: GithubInstallationRepository },
    { provide: IGithubInstallStateRepository, useClass: GithubInstallStateRepository },
    CreateGithubInstallStateHandler,
    LinkGithubInstallationHandler,
    CompleteGithubInstallationHandler,
    ReconcileGithubInstallationHandler,
    GetInstallationRepositoriesHandler,
  ],
  exports: [IGithubInstallationRepository],
})
export class GithubAppModule {}
