import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { FlagRegistryConfigType } from '../types/flag-registry-config.type'
import { FlagCoverageSummaryType } from '../types/flag-coverage-summary.type'
import { TrackedFlagType } from '../types/tracked-flag.type'
import { TrackedFlagDetailType } from '../types/tracked-flag-detail.type'
import { ReleaseFlagType } from '../types/release-flag.type'
import { CarriedOverFlagType } from '../types/carried-over-flag.type'
import { ReleaseFlagDecisionResultType } from '../types/release-flag-decision.type'
import { ScanReleasePullRequestsSummaryType } from '../types/scan-release-pull-requests-summary.type'
import { SetFlagRegistryInput } from '../commands/set-flag-registry/set-flag-registry.input'
import { SetFlagRegistryCommand } from '../commands/set-flag-registry/set-flag-registry.command'
import { RunFlagCoverageCommand } from '../commands/run-flag-coverage/run-flag-coverage.command'
import { RunFlagCoverageForFlagCommand } from '../commands/run-flag-coverage-for-flag/run-flag-coverage-for-flag.command'
import { ScanReleasePullRequestsCommand } from '../commands/scan-release-pull-requests/scan-release-pull-requests.command'
import { SetReleaseFlagDecisionInput } from '../commands/set-release-flag-decision/set-release-flag-decision.input'
import { SetReleaseFlagDecisionCommand } from '../commands/set-release-flag-decision/set-release-flag-decision.command'
import { GetTrackedFlagsQuery } from '../queries/get-tracked-flags/get-tracked-flags.query'
import { GetTrackedFlagDetailQuery } from '../queries/get-tracked-flag-detail/get-tracked-flag-detail.query'
import { GetReleaseFlagsQuery } from '../queries/get-release-flags/get-release-flags.query'
import { GetCarriedOverFlagsQuery } from '../queries/get-carried-over-flags/get-carried-over-flags.query'
import { GetFlagRegistryQuery } from '../queries/get-flag-registry/get-flag-registry.query'
import { GetFlagHistoryQuery } from '../queries/get-flag-history/get-flag-history.query'
import { GetFlagDetailQuery } from '../queries/get-flag-detail/get-flag-detail.query'
import { GetFlagHistoryInput, FlagHistoryPageType } from '../types/flag-history.type'
import { FlagDetailType } from '../types/flag-detail.type'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FlagTrackingResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Mutation(() => FlagRegistryConfigType)
  @Can(Action.UPDATE, Subject.PROJECT)
  setFlagRegistry(
    @Args('input', { type: () => SetFlagRegistryInput }) input: SetFlagRegistryInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagRegistryConfigType> {
    return this.commandBus.execute(
      new SetFlagRegistryCommand(input.projectId, user.id, input.path, input.branch ?? null),
    )
  }

  @Mutation(() => FlagCoverageSummaryType)
  @Can(Action.UPDATE, Subject.PROJECT)
  runFlagCoverage(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagCoverageSummaryType> {
    return this.commandBus.execute(new RunFlagCoverageCommand(projectId, user.id))
  }

  @Mutation(() => TrackedFlagDetailType)
  @Can(Action.UPDATE, Subject.PROJECT)
  runFlagCoverageForFlag(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('key', { type: () => String }) key: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<TrackedFlagDetailType> {
    return this.commandBus.execute(new RunFlagCoverageForFlagCommand(projectId, key, user.id))
  }

  @Mutation(() => ScanReleasePullRequestsSummaryType)
  @Can(Action.UPDATE, Subject.RELEASE)
  scanReleasePullRequests(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ScanReleasePullRequestsSummaryType> {
    return this.commandBus.execute(new ScanReleasePullRequestsCommand(releaseId, user.id))
  }

  @Mutation(() => ReleaseFlagDecisionResultType)
  @Can(Action.UPDATE, Subject.RELEASE)
  setReleaseFlagDecision(
    @Args('input', { type: () => SetReleaseFlagDecisionInput }) input: SetReleaseFlagDecisionInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseFlagDecisionResultType> {
    return this.commandBus.execute(
      new SetReleaseFlagDecisionCommand(input.releaseId, input.trackedFlagId, input.decision, user.id),
    )
  }

  @Query(() => [TrackedFlagType])
  @Can(Action.READ, Subject.PROJECT)
  trackedFlags(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<TrackedFlagType[]> {
    return this.queryBus.execute(new GetTrackedFlagsQuery(projectId, user.id))
  }

  @Query(() => TrackedFlagDetailType, { nullable: true })
  @Can(Action.READ, Subject.PROJECT)
  trackedFlag(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('key', { type: () => String }) key: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<TrackedFlagDetailType | null> {
    return this.queryBus.execute(new GetTrackedFlagDetailQuery(projectId, key, user.id))
  }

  @Query(() => [ReleaseFlagType])
  @Can(Action.READ, Subject.RELEASE)
  releaseFlags(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseFlagType[]> {
    return this.queryBus.execute(new GetReleaseFlagsQuery(releaseId, user.id))
  }

  @Query(() => [CarriedOverFlagType])
  @Can(Action.READ, Subject.RELEASE)
  carriedOverFlags(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<CarriedOverFlagType[]> {
    return this.queryBus.execute(new GetCarriedOverFlagsQuery(releaseId, user.id))
  }

  @Query(() => FlagRegistryConfigType)
  @Can(Action.READ, Subject.PROJECT)
  flagRegistry(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagRegistryConfigType> {
    return this.queryBus.execute(new GetFlagRegistryQuery(projectId, user.id))
  }

  @Query(() => FlagHistoryPageType)
  @Can(Action.READ, Subject.PROJECT)
  flagHistory(
    @Args('input', { type: () => GetFlagHistoryInput }) input: GetFlagHistoryInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagHistoryPageType> {
    return this.queryBus.execute(
      new GetFlagHistoryQuery(input.projectId, input.flagKey, user.id, input.limit ?? 20, input.offset ?? 0),
    )
  }

  @Query(() => FlagDetailType, { nullable: true })
  @Can(Action.READ, Subject.PROJECT)
  flagDetail(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('key', { type: () => String }) key: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagDetailType | null> {
    return this.queryBus.execute(new GetFlagDetailQuery(projectId, key, user.id))
  }
}
