import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ProjectModule } from '../project/project.module'
import { IntegrationModule } from '../integration/integration.module'
import { GithubAuthModule } from '../github-auth/github-auth.module'
import { ReleaseModule } from '../release/release.module'
import { FlagTrackingResolver } from './resolvers/flag-tracking.resolver'
import { ITrackedFlagRepository } from './interfaces/tracked-flag.repository'
import { TrackedFlagRepository } from './repositories/tracked-flag.repository'
import { IFlagBranchPresenceRepository } from './interfaces/flag-branch-presence.repository'
import { FlagBranchPresenceRepository } from './repositories/flag-branch-presence.repository'
import { IPullRequestFlagChangeRepository } from './interfaces/pull-request-flag-change.repository'
import { PullRequestFlagChangeRepository } from './repositories/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from './interfaces/release-flag-decision.repository'
import { ReleaseFlagDecisionRepository } from './repositories/release-flag-decision.repository'
import { IFlagRegistryParser } from './interfaces/flag-registry-parser.abstract'
import { FlagRegistryParser } from './parsers/flag-registry-parser'
import { SetFlagRegistryHandler } from './commands/set-flag-registry/set-flag-registry.handler'
import { RunFlagCoverageHandler } from './commands/run-flag-coverage/run-flag-coverage.handler'
import { RunFlagCoverageForFlagHandler } from './commands/run-flag-coverage-for-flag/run-flag-coverage-for-flag.handler'
import { ScanReleasePullRequestsHandler } from './commands/scan-release-pull-requests/scan-release-pull-requests.handler'
import { SetReleaseFlagDecisionHandler } from './commands/set-release-flag-decision/set-release-flag-decision.handler'
import { GetTrackedFlagsHandler } from './queries/get-tracked-flags/get-tracked-flags.handler'
import { GetTrackedFlagDetailHandler } from './queries/get-tracked-flag-detail/get-tracked-flag-detail.handler'
import { GetReleaseFlagsHandler } from './queries/get-release-flags/get-release-flags.handler'
import { GetFlagRegistryHandler } from './queries/get-flag-registry/get-flag-registry.handler'

@Module({
  imports: [CqrsModule, ProjectModule, IntegrationModule, GithubAuthModule, forwardRef(() => ReleaseModule)],
  providers: [
    FlagTrackingResolver,
    { provide: ITrackedFlagRepository, useClass: TrackedFlagRepository },
    { provide: IFlagBranchPresenceRepository, useClass: FlagBranchPresenceRepository },
    { provide: IPullRequestFlagChangeRepository, useClass: PullRequestFlagChangeRepository },
    { provide: IReleaseFlagDecisionRepository, useClass: ReleaseFlagDecisionRepository },
    { provide: IFlagRegistryParser, useClass: FlagRegistryParser },
    SetFlagRegistryHandler,
    RunFlagCoverageHandler,
    RunFlagCoverageForFlagHandler,
    ScanReleasePullRequestsHandler,
    SetReleaseFlagDecisionHandler,
    GetTrackedFlagsHandler,
    GetTrackedFlagDetailHandler,
    GetReleaseFlagsHandler,
    GetFlagRegistryHandler,
  ],
  exports: [IPullRequestFlagChangeRepository, ITrackedFlagRepository, IReleaseFlagDecisionRepository],
})
export class FlagTrackingModule {}
