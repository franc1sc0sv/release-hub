import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { IntegrationModule } from '../integration/integration.module'
import { LinearAuthModule } from '../linear-auth/linear-auth.module'
import { OrganizationModule } from '../organization/organization.module'
import { ReleaseModule } from '../release/release.module'
import { LinearIssueClient } from './clients/linear-issue.client'
import { SyncLinearHandler } from './commands/sync-linear/sync-linear.handler'
import { SyncLinearOnFlagTransitionHandler } from './events/sync-linear-on-flag-transition.handler'
import { SyncLinearOnReleaseDeployedHandler } from './events/sync-linear-on-release-deployed.handler'
import { ILinearIssueClient } from './interfaces/linear-issue-client.abstract'
import { ILinearSyncActionRepository } from './interfaces/linear-sync-action.repository'
import { ILinearSyncSourceRepository } from './interfaces/linear-sync-source.repository'
import { GetReleaseLinearSyncHandler } from './queries/get-release-linear-sync/get-release-linear-sync.handler'
import { LinearSyncActionRepository } from './repositories/linear-sync-action.repository'
import { LinearSyncSourceRepository } from './repositories/linear-sync-source.repository'
import { LinearSyncResolver } from './resolvers/linear-sync.resolver'

@Module({
  imports: [CqrsModule, OrganizationModule, ReleaseModule, LinearAuthModule, IntegrationModule],
  providers: [
    LinearSyncResolver,
    { provide: ILinearIssueClient, useClass: LinearIssueClient },
    { provide: ILinearSyncActionRepository, useClass: LinearSyncActionRepository },
    { provide: ILinearSyncSourceRepository, useClass: LinearSyncSourceRepository },
    SyncLinearHandler,
    GetReleaseLinearSyncHandler,
    SyncLinearOnReleaseDeployedHandler,
    SyncLinearOnFlagTransitionHandler,
  ],
})
export class LinearSyncModule {}
