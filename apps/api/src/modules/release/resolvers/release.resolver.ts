import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { ReleaseObjectType } from '../types/release.type'
import { ReleaseTreeType } from '../types/release-tree.type'
import { CoverageType } from '../types/coverage.type'
import { PullRequestType } from '../types/pull-request.type'
import { ExportResultType } from '../types/export-result.type'
import { ResyncReleaseSummaryType } from '../types/resync-release-summary.type'
import { ReleasesPageType } from '../types/releases-page.type'
import { ReleasePullRequestsPageType } from '../types/release-pull-requests-page.type'
import { InProgressFlagReminderType } from '../types/in-progress-flag-reminder.type'
import { SyncGithubDeploymentsResultType } from '../types/sync-github-deployments-result.type'
import { CreateReleaseInput } from '../types/create-release.input'
import { ExportSummaryInput } from '../types/export-summary.input'
import { UpdateReleaseInput } from '../commands/update-release/update-release.input'
import { ConfirmReleaseInput } from '../commands/confirm-release/confirm-release.input'
import { ShipReleaseInput } from '../commands/ship-release/ship-release.input'
import { SaveReleaseSummaryInput } from '../commands/save-release-summary/save-release-summary.input'
import { SavePrSummaryInput } from '../commands/save-pr-summary/save-pr-summary.input'
import { GetReleasesPageQuery } from '../queries/get-releases-page/get-releases-page.query'
import { GetReleaseQuery } from '../queries/get-release/get-release.query'
import { GetReleaseTreeQuery } from '../queries/get-release-tree/get-release-tree.query'
import { GetCoverageQuery } from '../queries/get-coverage/get-coverage.query'
import { ExportSummaryQuery } from '../queries/export-summary/export-summary.query'
import { GetInProgressFlagRemindersQuery } from '../queries/get-in-progress-flag-reminders/get-in-progress-flag-reminders.query'
import { GetReleasePullRequestsPageQuery } from '../queries/get-release-pull-requests-page/get-release-pull-requests-page.query'
import { CreateReleaseCommand } from '../commands/create-release/create-release.command'
import { UpdateReleaseCommand } from '../commands/update-release/update-release.command'
import { ConfirmReleaseCommand } from '../commands/confirm-release/confirm-release.command'
import { ShipReleaseCommand } from '../commands/ship-release/ship-release.command'
import { SaveReleaseSummaryCommand } from '../commands/save-release-summary/save-release-summary.command'
import { SavePrSummaryCommand } from '../commands/save-pr-summary/save-pr-summary.command'
import { DeleteReleaseCommand } from '../commands/delete-release/delete-release.command'
import { SetReleaseStatusInput } from '../commands/set-release-status/set-release-status.input'
import { SetReleaseStatusCommand } from '../commands/set-release-status/set-release-status.command'
import { ResyncReleasePullRequestsCommand } from '../commands/resync-release-pull-requests/resync-release-pull-requests.command'
import { ConfirmReleaseAdditionsCommand } from '../commands/confirm-release-additions/confirm-release-additions.command'
import { SyncGithubDeploymentsCommand } from '../commands/sync-github-deployments/sync-github-deployments.command'

@Resolver(() => ReleaseObjectType)
@UseGuards(JwtAuthGuard)
export class ReleaseResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.RELEASE)
  getRelease(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.queryBus.execute(new GetReleaseQuery(user.id, id))
  }

  @Query(() => ReleaseTreeType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.RELEASE)
  getReleaseTree(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseTreeType> {
    return this.queryBus.execute(new GetReleaseTreeQuery(user.id, id))
  }

  @Query(() => CoverageType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.RELEASE)
  getCoverage(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<CoverageType> {
    return this.queryBus.execute(new GetCoverageQuery(releaseId, user.id))
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.CREATE, Subject.RELEASE)
  createRelease(
    @Args('input', { type: () => CreateReleaseInput }) input: CreateReleaseInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(
      new CreateReleaseCommand(
        user.id,
        input.projectId,
        input.baseRef,
        input.compareRef,
        input.tags ?? [],
      ),
    )
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  updateRelease(
    @Args('input', { type: () => UpdateReleaseInput }) input: UpdateReleaseInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(
      new UpdateReleaseCommand(
        user.id,
        input.releaseId,
        input.tags,
        input.prAssignments?.map((a) => ({ pullRequestId: a.pullRequestId, featureId: a.featureId })),
      ),
    )
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  confirmRelease(
    @Args('input', { type: () => ConfirmReleaseInput }) input: ConfirmReleaseInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(new ConfirmReleaseCommand(user.id, input.releaseId))
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  shipRelease(
    @Args('input', { type: () => ShipReleaseInput }) input: ShipReleaseInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(new ShipReleaseCommand(user.id, input.releaseId))
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  saveReleaseSummary(
    @Args('input', { type: () => SaveReleaseSummaryInput }) input: SaveReleaseSummaryInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(
      new SaveReleaseSummaryCommand(
        user.id,
        input.releaseId,
        input.summary,
        input.summaryProfileId,
        input.summaryModel,
      ),
    )
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.DELETE, Subject.RELEASE)
  deleteRelease(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(new DeleteReleaseCommand(releaseId, user.id))
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  setReleaseStatus(
    @Args('input', { type: () => SetReleaseStatusInput }) input: SetReleaseStatusInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(new SetReleaseStatusCommand(user.id, input.releaseId, input.status))
  }

  @Mutation(() => PullRequestType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.PULL_REQUEST)
  savePrSummary(
    @Args('input', { type: () => SavePrSummaryInput }) input: SavePrSummaryInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<PullRequestType> {
    return this.commandBus.execute(
      new SavePrSummaryCommand(input.prId, input.summary, user.id),
    )
  }

  @Query(() => ExportResultType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.RELEASE)
  exportSummary(
    @Args('input', { type: () => ExportSummaryInput }) input: ExportSummaryInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ExportResultType> {
    return this.queryBus.execute(
      new ExportSummaryQuery(user.id, input.releaseId, input.format),
    )
  }

  @Mutation(() => ResyncReleaseSummaryType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  resyncReleasePullRequests(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ResyncReleaseSummaryType> {
    return this.commandBus.execute(new ResyncReleasePullRequestsCommand(user.id, releaseId))
  }

  @Mutation(() => ReleaseObjectType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  confirmReleaseAdditions(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    return this.commandBus.execute(new ConfirmReleaseAdditionsCommand(user.id, releaseId))
  }

  @Mutation(() => SyncGithubDeploymentsResultType)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.RELEASE)
  syncGithubDeployments(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SyncGithubDeploymentsResultType> {
    return this.commandBus.execute(new SyncGithubDeploymentsCommand(user.id, releaseId))
  }

  @Query(() => ReleasesPageType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.RELEASE)
  getReleasesPage(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    @Args('search', { type: () => String, nullable: true }) search: string | null | undefined,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleasesPageType> {
    const cappedLimit = Math.min(Math.max(limit, 1), 50)
    return this.queryBus.execute(
      new GetReleasesPageQuery(user.id, projectId, cappedLimit, Math.max(offset, 0), search ?? null),
    )
  }

  @Query(() => ReleasePullRequestsPageType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PULL_REQUEST)
  releasePullRequestsPage(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    @Args('search', { type: () => String, nullable: true }) search: string | null | undefined,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleasePullRequestsPageType> {
    const cappedLimit = Math.min(Math.max(limit, 1), 50)
    return this.queryBus.execute(
      new GetReleasePullRequestsPageQuery(user.id, releaseId, cappedLimit, Math.max(offset, 0), search ?? null),
    )
  }

  @Query(() => [InProgressFlagReminderType])
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  inProgressFlagReminders(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('excludeReleaseId', { type: () => ID, nullable: true }) excludeReleaseId: string | null | undefined,
    @CurrentUser() user: IJwtUser,
  ): Promise<InProgressFlagReminderType[]> {
    return this.queryBus.execute(
      new GetInProgressFlagRemindersQuery(user.id, projectId, excludeReleaseId ?? null),
    )
  }
}
