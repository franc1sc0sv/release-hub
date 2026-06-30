import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { IntegrationModule } from '../integration/integration.module'
import { ProjectModule } from '../project/project.module'
import { GithubAuthModule } from '../github-auth/github-auth.module'
import { LinearAuthModule } from '../linear-auth/linear-auth.module'

import { ReleaseResolver } from './resolvers/release.resolver'
import { IReleaseRepository } from './interfaces/release.repository'
import { IPullRequestRepository } from './interfaces/pull-request.repository'
import { ICommitRepository } from './interfaces/commit.repository'
import { IFeatureInReleaseRepository } from './interfaces/feature-in-release.repository'
import { IFeatureRepository } from '../feature/interfaces/feature.repository'
import { IFlagsmithClient } from '../integration/interfaces/flagsmith-client.abstract'
import { FlagsmithClient } from '../integration/clients/flagsmith.client'
import { ReleaseRepository } from './repositories/release.repository'
import { PullRequestRepository } from './repositories/pull-request.repository'
import { CommitRepository } from './repositories/commit.repository'
import { FeatureInReleaseRepository } from './repositories/feature-in-release.repository'
import { FeatureRepository } from '../feature/repositories/feature.repository'
import { DiffRefsHandler } from './queries/diff-refs/diff-refs.handler'
import { GetReleasesHandler } from './queries/get-releases/get-releases.handler'
import { GetReleaseHandler } from './queries/get-release/get-release.handler'
import { GetReleaseTreeHandler } from './queries/get-release-tree/get-release-tree.handler'
import { GetCoverageHandler } from './queries/get-coverage/get-coverage.handler'
import { ExportSummaryHandler } from './queries/export-summary/export-summary.handler'
import { CreateReleaseHandler } from './commands/create-release/create-release.handler'
import { UpdateReleaseHandler } from './commands/update-release/update-release.handler'
import { ConfirmReleaseHandler } from './commands/confirm-release/confirm-release.handler'
import { ShipReleaseHandler } from './commands/ship-release/ship-release.handler'
import { SaveReleaseSummaryHandler } from './commands/save-release-summary/save-release-summary.handler'
import { SavePrSummaryHandler } from './commands/save-pr-summary/save-pr-summary.handler'
import { DeleteReleaseHandler } from './commands/delete-release/delete-release.handler'
import { SetReleaseStatusHandler } from './commands/set-release-status/set-release-status.handler'

@Module({
  imports: [CqrsModule, IntegrationModule, ProjectModule, GithubAuthModule, LinearAuthModule],
  providers: [
    ReleaseResolver,
    { provide: IReleaseRepository, useClass: ReleaseRepository },
    { provide: IPullRequestRepository, useClass: PullRequestRepository },
    { provide: ICommitRepository, useClass: CommitRepository },
    { provide: IFeatureInReleaseRepository, useClass: FeatureInReleaseRepository },
    { provide: IFeatureRepository, useClass: FeatureRepository },
    { provide: IFlagsmithClient, useClass: FlagsmithClient },
    DiffRefsHandler,
    GetReleasesHandler,
    GetReleaseHandler,
    GetReleaseTreeHandler,
    GetCoverageHandler,
    ExportSummaryHandler,
    CreateReleaseHandler,
    UpdateReleaseHandler,
    ConfirmReleaseHandler,
    ShipReleaseHandler,
    SaveReleaseSummaryHandler,
    SavePrSummaryHandler,
    DeleteReleaseHandler,
    SetReleaseStatusHandler,
  ],
  exports: [IPullRequestRepository, IReleaseRepository],
})
export class ReleaseModule {}
