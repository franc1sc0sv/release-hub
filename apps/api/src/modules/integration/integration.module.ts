import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { LinearAuthModule } from '../linear-auth/linear-auth.module'
import { IntegrationResolver } from './resolvers/integration.resolver'
import { IGitHubClient } from './interfaces/github-client.interface'
import { GitHubClient } from './github.client'
import { IFlagsmithClient } from './interfaces/flagsmith-client.abstract'
import { FlagsmithClient } from './clients/flagsmith.client'
import { ITicketSource } from './interfaces/ticket-source.abstract'
import { LinearTicketSource } from './clients/linear-ticket-source'
import { ITicketLinkRepository } from './interfaces/ticket-link.repository'
import { TicketLinkRepository } from './repositories/ticket-link.repository'
import { GetFlagsHandler } from './queries/get-flags/get-flags.handler'
import { CompareFlagsHandler } from './queries/compare-flags/compare-flags.handler'
import { GetConnectionSettingsHandler } from './queries/get-connection-settings/get-connection-settings.handler'
import { GetFlagsmithProjectsHandler } from './queries/get-flagsmith-projects/get-flagsmith-projects.handler'
import { VerifyFlagsmithConnectionHandler } from './queries/verify-flagsmith-connection/verify-flagsmith-connection.handler'
import { EnrichPrTicketsHandler } from './queries/enrich-pr-tickets/enrich-pr-tickets.handler'
import { UpdateConnectionSettingsHandler } from './commands/update-connection-settings/update-connection-settings.handler'

@Module({
  imports: [CqrsModule, ProjectModule, LinearAuthModule],
  providers: [
    IntegrationResolver,
    { provide: IGitHubClient, useClass: GitHubClient },
    { provide: IFlagsmithClient, useClass: FlagsmithClient },
    { provide: ITicketSource, useClass: LinearTicketSource },
    { provide: ITicketLinkRepository, useClass: TicketLinkRepository },
    GetFlagsHandler,
    CompareFlagsHandler,
    GetConnectionSettingsHandler,
    GetFlagsmithProjectsHandler,
    VerifyFlagsmithConnectionHandler,
    EnrichPrTicketsHandler,
    UpdateConnectionSettingsHandler,
  ],
  exports: [IGitHubClient, ITicketSource, ITicketLinkRepository],
})
export class IntegrationModule {}
