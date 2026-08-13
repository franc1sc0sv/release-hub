import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { IntegrationModule } from '../integration/integration.module'
import { ProjectModule } from '../project/project.module'
import { OrganizationModule } from '../organization/organization.module'
import { LinearAuthModule } from '../linear-auth/linear-auth.module'
import { FlagTrackingModule } from '../flag-tracking/flag-tracking.module'

import { ReleaseResolver } from './resolvers/release.resolver'
import { IReleaseRepository } from './interfaces/release.repository'
import { IPullRequestRepository } from './interfaces/pull-request.repository'
import { ICommitRepository } from './interfaces/commit.repository'
import { IFeatureInReleaseRepository } from './interfaces/feature-in-release.repository'
import { IFeatureRepository } from '../feature/interfaces/feature.repository'
import { ReleaseRepository } from './repositories/release.repository'
import { PullRequestRepository } from './repositories/pull-request.repository'
import { CommitRepository } from './repositories/commit.repository'
import { FeatureInReleaseRepository } from './repositories/feature-in-release.repository'
import { FeatureRepository } from '../feature/repositories/feature.repository'
import { GetReleasesPageHandler } from './queries/get-releases-page/get-releases-page.handler'
import { GetReleaseHandler } from './queries/get-release/get-release.handler'
import { GetReleaseTreeHandler } from './queries/get-release-tree/get-release-tree.handler'
import { GetCoverageHandler } from './queries/get-coverage/get-coverage.handler'
import { ExportSummaryHandler } from './queries/export-summary/export-summary.handler'
import { GetInProgressFlagRemindersHandler } from './queries/get-in-progress-flag-reminders/get-in-progress-flag-reminders.handler'
import { GetReleasePullRequestsPageHandler } from './queries/get-release-pull-requests-page/get-release-pull-requests-page.handler'
import { CreateReleaseHandler } from './commands/create-release/create-release.handler'
import { UpdateReleaseHandler } from './commands/update-release/update-release.handler'
import { ConfirmReleaseHandler } from './commands/confirm-release/confirm-release.handler'
import { ShipReleaseHandler } from './commands/ship-release/ship-release.handler'
import { SaveReleaseSummaryHandler } from './commands/save-release-summary/save-release-summary.handler'
import { SavePrSummaryHandler } from './commands/save-pr-summary/save-pr-summary.handler'
import { DeleteReleaseHandler } from './commands/delete-release/delete-release.handler'
import { SetReleaseStatusHandler } from './commands/set-release-status/set-release-status.handler'
import { SystemSetReleaseStatusHandler } from './commands/system-set-release-status/system-set-release-status.handler'
import { ResyncReleasePullRequestsHandler } from './commands/resync-release-pull-requests/resync-release-pull-requests.handler'
import { ConfirmReleaseAdditionsHandler } from './commands/confirm-release-additions/confirm-release-additions.handler'
import { SyncGithubDeploymentsHandler } from './commands/sync-github-deployments/sync-github-deployments.handler'
import { HandleGithubDeploymentWebhookHandler } from './commands/handle-github-deployment-webhook/handle-github-deployment-webhook.handler'

@Module({
  imports: [
    CqrsModule,
    IntegrationModule,
    ProjectModule,
    OrganizationModule,
    LinearAuthModule,
    forwardRef(() => FlagTrackingModule),
  ],
  providers: [
    ReleaseResolver,
    { provide: IReleaseRepository, useClass: ReleaseRepository },
    { provide: IPullRequestRepository, useClass: PullRequestRepository },
    { provide: ICommitRepository, useClass: CommitRepository },
    { provide: IFeatureInReleaseRepository, useClass: FeatureInReleaseRepository },
    { provide: IFeatureRepository, useClass: FeatureRepository },
    GetReleasesPageHandler,
    GetReleaseHandler,
    GetReleaseTreeHandler,
    GetCoverageHandler,
    ExportSummaryHandler,
    GetInProgressFlagRemindersHandler,
    GetReleasePullRequestsPageHandler,
    CreateReleaseHandler,
    UpdateReleaseHandler,
    ConfirmReleaseHandler,
    ShipReleaseHandler,
    SaveReleaseSummaryHandler,
    SavePrSummaryHandler,
    DeleteReleaseHandler,
    SetReleaseStatusHandler,
    SystemSetReleaseStatusHandler,
    ResyncReleasePullRequestsHandler,
    ConfirmReleaseAdditionsHandler,
    SyncGithubDeploymentsHandler,
    HandleGithubDeploymentWebhookHandler,
  ],
  exports: [IPullRequestRepository, IReleaseRepository, IFeatureInReleaseRepository],
})
export class ReleaseModule {}
