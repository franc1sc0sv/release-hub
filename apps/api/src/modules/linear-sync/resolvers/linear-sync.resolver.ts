import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Action, Subject } from '@release-hub/shared'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { SyncLinearCommand } from '../commands/sync-linear/sync-linear.command'
import { GetReleaseLinearSyncQuery } from '../queries/get-release-linear-sync/get-release-linear-sync.query'
import { LinearSyncActionType } from '../types/linear-sync-action.type'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class LinearSyncResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [LinearSyncActionType])
  @Can(Action.READ, Subject.RELEASE)
  releaseLinearSync(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<LinearSyncActionType[]> {
    return this.queryBus.execute(new GetReleaseLinearSyncQuery(releaseId, user.id))
  }

  @Mutation(() => [LinearSyncActionType])
  @Can(Action.UPDATE, Subject.RELEASE)
  async syncReleaseToLinear(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<LinearSyncActionType[]> {
    await this.commandBus.execute(new SyncLinearCommand(projectId, releaseId, null, user.id))
    return this.queryBus.execute(new GetReleaseLinearSyncQuery(releaseId, user.id))
  }
}
