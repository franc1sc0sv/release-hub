import { Args, Context, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql'
import { UnauthorizedException, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { AiSuggestionType } from '../types/ai-suggestion.type'
import { SummaryChunkType } from '../types/summary-chunk.type'
import { GenerateSummaryInput } from '../types/generate-summary.input'
import { PullRequestType } from '../../release/types/pull-request.type'
import { SuggestFeatureForPrQuery } from '../queries/suggest-feature-for-pr/suggest-feature-for-pr.query'
import { GenerateSummaryQuery } from '../queries/generate-summary/generate-summary.query'
import { GeneratePrSummaryCommand } from '../commands/generate-pr-summary/generate-pr-summary.command'
import { RegenerateDraftCommand } from '../commands/regenerate-draft/regenerate-draft.command'
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
    return this.commandBus.execute(new RegenerateDraftCommand(releaseId, user.id, resume))
  }

  @Mutation(() => PullRequestType)
  @Can(Action.UPDATE, Subject.PULL_REQUEST)
  generatePrSummary(
    @Args('prId', { type: () => ID }) prId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<PullRequestType> {
    return this.commandBus.execute(new GeneratePrSummaryCommand(prId, user.id))
  }

  @Query(() => AiSuggestionType)
  @Can(Action.READ, Subject.PULL_REQUEST)
  async suggestFeatureForPr(
    @Args('prId', { type: () => ID }) prId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<AiSuggestionType> {
    return this.queryBus.execute<SuggestFeatureForPrQuery, AiSuggestionType>(
      new SuggestFeatureForPrQuery(prId, user.id),
    )
  }

  @Subscription(() => SummaryChunkType)
  @UseGuards(JwtAuthGuard)
  async generateSummary(
    @Args('input', { type: () => GenerateSummaryInput }) input: GenerateSummaryInput,
    @Context() ctx: { req?: { user?: IJwtUser } },
  ): Promise<AsyncIterator<{ generateSummary: SummaryChunkType }>> {
    const user = ctx.req?.user
    if (!user) {
      throw new UnauthorizedException()
    }

    const iterable = await this.queryBus.execute<
      GenerateSummaryQuery,
      AsyncIterable<SummaryChunkType>
    >(
      new GenerateSummaryQuery(
        input.releaseId,
        user.id,
        input.model,
        input.tone,
        input.featureIds,
      ),
    )

    return wrapWithFieldName(iterable)
  }
}

async function* wrapWithFieldName(
  source: AsyncIterable<SummaryChunkType>,
): AsyncGenerator<{ generateSummary: SummaryChunkType }> {
  for await (const chunk of source) {
    yield { generateSummary: chunk }
  }
}
