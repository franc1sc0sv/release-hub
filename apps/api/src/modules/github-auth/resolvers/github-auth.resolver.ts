import { Args, ID, Mutation, Query, Resolver, Context } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import type { Response } from 'express'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { GithubConnectionStatus } from '../types/github-connection-status.type'
import { GithubRepositoryType } from '../types/github-repository.type'
import { GithubBranchType } from '../types/github-branch.type'
import { RefComparisonType } from '../types/ref-comparison.type'
import { GetGithubConnectionQuery } from '../queries/get-github-connection/get-github-connection.query'
import { ListGithubRepositoriesQuery } from '../queries/list-github-repositories/list-github-repositories.query'
import { ListGithubBranchesQuery } from '../queries/list-github-branches/list-github-branches.query'
import { CompareRefsQuery } from '../queries/compare-refs/compare-refs.query'
import { DisconnectGithubCommand } from '../commands/disconnect-github/disconnect-github.command'
import { ReauthorizeGithubCommand } from '../commands/reauthorize-github/reauthorize-github.command'
import { CreateGithubBranchCommand } from '../commands/create-github-branch/create-github-branch.command'
import { CreateGithubBranchInput } from '../commands/create-github-branch/create-github-branch.input'

interface IGqlContext {
  res: Response
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class GithubAuthResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => String)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.USER)
  githubAuthorizeUrl(
    @CurrentUser() user: IJwtUser,
    @Context() ctx: IGqlContext,
  ): string {
    const clientId = process.env.GITHUB_APP_CLIENT_ID!
    const callbackUrl =
      process.env.GITHUB_APP_CALLBACK_URL ?? 'http://localhost:3001/auth/github/callback'

    const stateValue = randomBytes(32).toString('base64url')
    const signedState = this.jwtService.sign({ sub: user.id, nonce: stateValue }, { expiresIn: '10m' })

    ctx.res.cookie('gh_oauth_state', stateValue, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 600_000,
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      state: signedState,
      scope: 'repo read:org',
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  @Query(() => GithubConnectionStatus)
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.USER)
  githubConnection(@CurrentUser() user: IJwtUser): Promise<GithubConnectionStatus> {
    return this.queryBus.execute(new GetGithubConnectionQuery(user.id))
  }

  @Query(() => [GithubRepositoryType])
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.USER)
  githubRepositories(@CurrentUser() user: IJwtUser): Promise<GithubRepositoryType[]> {
    return this.queryBus.execute(new ListGithubRepositoriesQuery(user.id))
  }

  @Query(() => [GithubBranchType])
  @UseGuards(PoliciesGuard)
  @Can(Action.READ, Subject.PROJECT)
  githubBranches(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubBranchType[]> {
    return this.queryBus.execute(new ListGithubBranchesQuery(user.id, projectId))
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

  @Mutation(() => Boolean)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.USER)
  disconnectGithub(@CurrentUser() user: IJwtUser): Promise<boolean> {
    return this.commandBus.execute(new DisconnectGithubCommand(user.id))
  }

  @Mutation(() => Boolean)
  @UseGuards(PoliciesGuard)
  @Can(Action.UPDATE, Subject.USER)
  reauthorizeGithub(@CurrentUser() user: IJwtUser): Promise<boolean> {
    return this.commandBus.execute(new ReauthorizeGithubCommand(user.id))
  }
}
