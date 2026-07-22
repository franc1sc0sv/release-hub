import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { SummaryProfileType } from '../types/summary-profile.type'
import { CreateSummaryProfileInput } from '../commands/create-summary-profile/create-summary-profile.input'
import { UpdateSummaryProfileInput } from '../commands/update-summary-profile/update-summary-profile.input'
import { DeleteSummaryProfileInput } from '../commands/delete-summary-profile/delete-summary-profile.input'
import { CreateSummaryProfileCommand } from '../commands/create-summary-profile/create-summary-profile.command'
import { UpdateSummaryProfileCommand } from '../commands/update-summary-profile/update-summary-profile.command'
import { DeleteSummaryProfileCommand } from '../commands/delete-summary-profile/delete-summary-profile.command'
import { ListSummaryProfilesQuery } from '../queries/list-summary-profiles/list-summary-profiles.query'
import { GetSummaryProfileQuery } from '../queries/get-summary-profile/get-summary-profile.query'

@Resolver(() => SummaryProfileType)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SummaryProfileResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [SummaryProfileType])
  @Can(Action.READ, Subject.SUMMARY_PROFILE)
  summaryProfiles(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SummaryProfileType[]> {
    return this.queryBus.execute(new ListSummaryProfilesQuery(projectId, user.id))
  }

  @Query(() => SummaryProfileType)
  @Can(Action.READ, Subject.SUMMARY_PROFILE)
  summaryProfile(
    @Args('profileId', { type: () => ID }) profileId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<SummaryProfileType> {
    return this.queryBus.execute(new GetSummaryProfileQuery(profileId, user.id))
  }

  @Mutation(() => SummaryProfileType)
  @Can(Action.CREATE, Subject.SUMMARY_PROFILE)
  createSummaryProfile(
    @Args('input', { type: () => CreateSummaryProfileInput }) input: CreateSummaryProfileInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<SummaryProfileType> {
    return this.commandBus.execute(
      new CreateSummaryProfileCommand(
        input.projectId,
        input.name,
        input.description ?? null,
        input.outputTemplate ?? null,
        input.rules,
        input.examples,
        user.id,
      ),
    )
  }

  @Mutation(() => SummaryProfileType)
  @Can(Action.UPDATE, Subject.SUMMARY_PROFILE)
  updateSummaryProfile(
    @Args('input', { type: () => UpdateSummaryProfileInput }) input: UpdateSummaryProfileInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<SummaryProfileType> {
    return this.commandBus.execute(
      new UpdateSummaryProfileCommand(
        input.profileId,
        input.name,
        input.description ?? null,
        input.outputTemplate ?? null,
        input.rules,
        input.examples,
        user.id,
      ),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.SUMMARY_PROFILE)
  deleteSummaryProfile(
    @Args('input', { type: () => DeleteSummaryProfileInput }) input: DeleteSummaryProfileInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteSummaryProfileCommand(input.profileId, user.id))
  }
}
