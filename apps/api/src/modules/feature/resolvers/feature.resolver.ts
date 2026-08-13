import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { FeatureType } from '../types/feature.type'
import { FeatureDetailType } from '../types/feature-detail.type'
import { FeaturePageType } from '../types/feature-page.type'
import { ListFeaturesPageInput } from '../types/list-features-page.input'
import { CreateFeatureInput } from '../types/create-feature.input'
import { AssignPrToFeatureInput } from '../types/assign-pr-to-feature.input'
import { FeatureInReleaseType } from '../types/feature-in-release.type'
import { SetFeatureStateInput } from '../commands/set-feature-state/set-feature-state.input'
import { SetFeatureReleaseStateInput } from '../commands/set-feature-release-state/set-feature-release-state.input'
import { SetFeatureReleaseStateCommand } from '../commands/set-feature-release-state/set-feature-release-state.command'
import { SetFeatureTagsInput } from '../commands/set-feature-tags/set-feature-tags.input'
import { ListFeaturesPageQuery } from '../queries/list-features-page/list-features-page.query'
import { GetFeatureQuery } from '../queries/get-feature/get-feature.query'
import { CreateFeatureCommand } from '../commands/create-feature/create-feature.command'
import { AssignPrToFeatureCommand } from '../commands/assign-pr-to-feature/assign-pr-to-feature.command'
import { SetFeatureStateCommand } from '../commands/set-feature-state/set-feature-state.command'
import { SetFeatureTagsCommand } from '../commands/set-feature-tags/set-feature-tags.command'
import { AcceptSuggestedFeatureInput } from '../commands/accept-suggested-feature/accept-suggested-feature.input'
import { RejectSuggestedFeatureInput } from '../commands/reject-suggested-feature/reject-suggested-feature.input'
import { AcceptSuggestedFeatureCommand } from '../commands/accept-suggested-feature/accept-suggested-feature.command'
import { RejectSuggestedFeatureCommand } from '../commands/reject-suggested-feature/reject-suggested-feature.command'
import { DeleteFeatureCommand } from '../commands/delete-feature/delete-feature.command'

@Resolver(() => FeatureType)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FeatureResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => FeaturePageType)
  @Can(Action.READ, Subject.FEATURE)
  listFeaturesPage(
    @Args('input', { type: () => ListFeaturesPageInput }) input: ListFeaturesPageInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeaturePageType> {
    return this.queryBus.execute(
      new ListFeaturesPageQuery(
        input.projectId,
        user.id,
        input.limit ?? 20,
        input.offset ?? 0,
        input.search,
        input.assignableOnly ?? false,
      ),
    )
  }

  @Query(() => FeatureDetailType)
  @Can(Action.READ, Subject.FEATURE)
  getFeature(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureDetailType> {
    return this.queryBus.execute(new GetFeatureQuery(id, user.id))
  }

  @Mutation(() => FeatureType)
  @Can(Action.CREATE, Subject.FEATURE)
  createFeature(
    @Args('input', { type: () => CreateFeatureInput }) input: CreateFeatureInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureType> {
    return this.commandBus.execute(
      new CreateFeatureCommand(input.projectId, input.name, input.description, user.id, input.tags),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.PULL_REQUEST)
  assignPrToFeature(
    @Args('input', { type: () => AssignPrToFeatureInput }) input: AssignPrToFeatureInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(
      new AssignPrToFeatureCommand(input.prId, input.featureId, user.id),
    )
  }

  @Mutation(() => FeatureType)
  @Can(Action.UPDATE, Subject.FEATURE)
  setFeatureState(
    @Args('input', { type: () => SetFeatureStateInput }) input: SetFeatureStateInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureType> {
    return this.commandBus.execute(
      new SetFeatureStateCommand(input.featureId, input.state, user.id),
    )
  }

  @Mutation(() => FeatureInReleaseType)
  @Can(Action.UPDATE, Subject.FEATURE)
  setFeatureReleaseState(
    @Args('input', { type: () => SetFeatureReleaseStateInput }) input: SetFeatureReleaseStateInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureInReleaseType> {
    return this.commandBus.execute(
      new SetFeatureReleaseStateCommand(
        input.featureId,
        input.releaseId,
        input.state,
        user.id,
        input.flagKey ?? null,
      ),
    )
  }

  @Mutation(() => FeatureType)
  @Can(Action.UPDATE, Subject.FEATURE)
  setFeatureTags(
    @Args('input', { type: () => SetFeatureTagsInput }) input: SetFeatureTagsInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureType> {
    return this.commandBus.execute(
      new SetFeatureTagsCommand(input.featureId, input.tags, user.id),
    )
  }

  @Mutation(() => FeatureType)
  @Can(Action.UPDATE, Subject.FEATURE)
  acceptSuggestedFeature(
    @Args('input', { type: () => AcceptSuggestedFeatureInput }) input: AcceptSuggestedFeatureInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FeatureType> {
    return this.commandBus.execute(
      new AcceptSuggestedFeatureCommand(
        input.featureId,
        user.id,
        input.name ?? null,
        input.description ?? null,
        input.tags ?? null,
      ),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.FEATURE)
  rejectSuggestedFeature(
    @Args('input', { type: () => RejectSuggestedFeatureInput }) input: RejectSuggestedFeatureInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(
      new RejectSuggestedFeatureCommand(input.featureId, user.id),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.FEATURE)
  deleteFeature(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteFeatureCommand(id, user.id))
  }
}
