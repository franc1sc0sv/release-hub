import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import { AiDisabledException } from '../../../common/errors'
import { isAiEnabled } from '../../../common/config/ai-availability'
import type { IJwtUser } from '../../../common/types'
import { AiSuggestionType } from '../types/ai-suggestion.type'
import { StartSummaryGenerationInput } from '../commands/start-summary-generation/start-summary-generation.input'
import { PullRequestType } from '../../release/types/pull-request.type'
import { SuggestFeatureForPrQuery } from '../queries/suggest-feature-for-pr/suggest-feature-for-pr.query'
import { GeneratePrSummaryCommand } from '../commands/generate-pr-summary/generate-pr-summary.command'
import { RegenerateDraftCommand } from '../commands/regenerate-draft/regenerate-draft.command'
import { StartSummaryGenerationCommand } from '../commands/start-summary-generation/start-summary-generation.command'
import { ReleaseObjectType } from '../../release/types/release.type'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class AiResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Mutation(() => ReleaseObjectType)
  @Can(Action.UPDATE, Subject.RELEASE)
  regenerateDraft(
    @Args('releaseId', { type: () => ID }) releaseId: string,
    @Args('resume', { type: () => Boolean, defaultValue: true }) resume: boolean,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    if (!isAiEnabled()) {
      throw new AiDisabledException()
    }
    return this.commandBus.execute(new RegenerateDraftCommand(releaseId, user.id, resume))
  }

  @Mutation(() => PullRequestType)
  @Can(Action.UPDATE, Subject.PULL_REQUEST)
  generatePrSummary(
    @Args('prId', { type: () => ID }) prId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<PullRequestType> {
    if (!isAiEnabled()) {
      throw new AiDisabledException()
    }
    return this.commandBus.execute(new GeneratePrSummaryCommand(prId, user.id))
  }

  @Query(() => AiSuggestionType)
  @Can(Action.READ, Subject.PULL_REQUEST)
  async suggestFeatureForPr(
    @Args('prId', { type: () => ID }) prId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<AiSuggestionType> {
    if (!isAiEnabled()) {
      throw new AiDisabledException()
    }
    return this.queryBus.execute<SuggestFeatureForPrQuery, AiSuggestionType>(
      new SuggestFeatureForPrQuery(prId, user.id),
    )
  }

  @Mutation(() => ReleaseObjectType)
  @Can(Action.UPDATE, Subject.RELEASE)
  startSummaryGeneration(
    @Args('input', { type: () => StartSummaryGenerationInput }) input: StartSummaryGenerationInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ReleaseObjectType> {
    if (!isAiEnabled()) {
      throw new AiDisabledException()
    }
    return this.commandBus.execute(
      new StartSummaryGenerationCommand(
        input.releaseId,
        user.id,
        input.model,
        input.summaryProfileId,
        input.featureIds,
      ),
    )
  }
}
