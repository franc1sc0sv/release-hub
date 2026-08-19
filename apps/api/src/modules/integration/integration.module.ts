import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { LinearAuthModule } from '../linear-auth/linear-auth.module'
import { FlagHistoryModule } from '../flag-tracking/flag-history.module'
import { OrganizationModule } from '../organization/organization.module'
import { IntegrationResolver } from './resolvers/integration.resolver'
import { IGitHubClient } from './interfaces/github-client.interface'
import { GitHubClient } from './github.client'
import { IGithubAppAuth } from './interfaces/github-app-auth.abstract'
import { GithubAppAuthService } from './github-app-auth.service'
import { IGithubTokenResolver } from './interfaces/github-token-resolver.abstract'
import { GithubTokenResolverService } from './github-token-resolver.service'
import { IFlagsmithClient } from './interfaces/flagsmith-client.abstract'
import { FlagsmithClient } from './clients/flagsmith.client'
import { ITicketSource } from './interfaces/ticket-source.abstract'
import { LinearTicketSource } from './clients/linear-ticket-source'
import { ITicketLinkRepository } from './interfaces/ticket-link.repository'
import { TicketLinkRepository } from './repositories/ticket-link.repository'
import { IFlagsmithFlagRepository } from './interfaces/flagsmith-flag.repository'
import { FlagsmithFlagRepository } from './repositories/flagsmith-flag.repository'
import { GetFlagsHandler } from './queries/get-flags/get-flags.handler'
import { GetFlagsmithEnvironmentsHandler } from './queries/get-flagsmith-environments/get-flagsmith-environments.handler'
import { CompareFlagsHandler } from './queries/compare-flags/compare-flags.handler'
import { GetConnectionSettingsHandler } from './queries/get-connection-settings/get-connection-settings.handler'
import { GetFlagsmithProjectsHandler } from './queries/get-flagsmith-projects/get-flagsmith-projects.handler'
import { VerifyFlagsmithConnectionHandler } from './queries/verify-flagsmith-connection/verify-flagsmith-connection.handler'
import { EnrichPrTicketsHandler } from './queries/enrich-pr-tickets/enrich-pr-tickets.handler'
import { RepoFileSearchHandler } from './queries/repo-file-search/repo-file-search.handler'
import { UpdateConnectionSettingsHandler } from './commands/update-connection-settings/update-connection-settings.handler'
import { SyncFlagsmithFlagsHandler } from './commands/sync-flagsmith-flags/sync-flagsmith-flags.handler'
import { RotateFlagsmithWebhookSecretHandler } from './commands/rotate-flagsmith-webhook-secret/rotate-flagsmith-webhook-secret.handler'
import { RotateGithubWebhookSecretHandler } from './commands/rotate-github-webhook-secret/rotate-github-webhook-secret.handler'
import { HandleFlagsmithWebhookHandler } from './commands/handle-flagsmith-webhook/handle-flagsmith-webhook.handler'
import { FlagsmithConnectedHandler } from './events/flagsmith-connected.handler'
import { FlagsmithReconcileCronService } from './services/flagsmith-reconcile-cron.service'

@Module({
  imports: [CqrsModule, ProjectModule, LinearAuthModule, FlagHistoryModule, OrganizationModule],
  providers: [
    IntegrationResolver,
    { provide: IGitHubClient, useClass: GitHubClient },
    { provide: IGithubAppAuth, useClass: GithubAppAuthService },
    { provide: IGithubTokenResolver, useClass: GithubTokenResolverService },
    { provide: IFlagsmithClient, useClass: FlagsmithClient },
    { provide: ITicketSource, useClass: LinearTicketSource },
    { provide: ITicketLinkRepository, useClass: TicketLinkRepository },
    { provide: IFlagsmithFlagRepository, useClass: FlagsmithFlagRepository },
    GetFlagsHandler,
    GetFlagsmithEnvironmentsHandler,
    CompareFlagsHandler,
    GetConnectionSettingsHandler,
    GetFlagsmithProjectsHandler,
    VerifyFlagsmithConnectionHandler,
    EnrichPrTicketsHandler,
    RepoFileSearchHandler,
    UpdateConnectionSettingsHandler,
    SyncFlagsmithFlagsHandler,
    RotateFlagsmithWebhookSecretHandler,
    RotateGithubWebhookSecretHandler,
    HandleFlagsmithWebhookHandler,
    FlagsmithConnectedHandler,
    FlagsmithReconcileCronService,
  ],
  exports: [
    IGitHubClient,
    IGithubAppAuth,
    IGithubTokenResolver,
    ITicketSource,
    ITicketLinkRepository,
    IFlagsmithFlagRepository,
  ],
})
export class IntegrationModule {}
