import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { GithubBranchType } from '../types/github-branch.type'
import { GithubBranchSearchResultType } from '../types/github-branch-search-result.type'
import { RefComparisonType } from '../types/ref-comparison.type'
import { ListGithubBranchesQuery } from '../queries/list-github-branches/list-github-branches.query'
import { SearchGithubBranchesQuery } from '../queries/search-github-branches/search-github-branches.query'
import { CompareRefsQuery } from '../queries/compare-refs/compare-refs.query'
import { CreateGithubBranchCommand } from '../commands/create-github-branch/create-github-branch.command'
import { CreateGithubBranchInput } from '../commands/create-github-branch/create-github-branch.input'

@Resolver()
@UseGuards(JwtAuthGuard)
export class GithubAuthResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [GithubBranchType])
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  githubBranches(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubBranchType[]> {
    return this.queryBus.execute(new ListGithubBranchesQuery(user.id, projectId))
  }

  @Query(() => GithubBranchSearchResultType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  searchGithubBranches(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('search', { type: () => String, nullable: true }) search: string | null | undefined,
    @Args('limit', { type: () => Number, defaultValue: 50 }) limit: number,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubBranchSearchResultType> {
    const cappedLimit = Math.min(Math.max(limit, 1), 100)
    return this.queryBus.execute(
      new SearchGithubBranchesQuery(user.id, projectId, search ?? null, cappedLimit),
    )
  }

  @Query(() => RefComparisonType)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  compareRefs(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('baseRef', { type: () => String }) baseRef: string,
    @Args('compareRef', { type: () => String }) compareRef: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<RefComparisonType> {
    return this.queryBus.execute(new CompareRefsQuery(user.id, projectId, baseRef, compareRef))
  }

  @Mutation(() => GithubBranchType)
  @UseGuards(PoliciesGuard)
  @Can(Action.CREATE, Subject.RELEASE)
  createGithubBranch(
    @Args('input', { type: () => CreateGithubBranchInput }) input: CreateGithubBranchInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubBranchType> {
    return this.commandBus.execute(
      new CreateGithubBranchCommand(user.id, input.projectId, input.name, input.fromRef),
    )
  }
}
