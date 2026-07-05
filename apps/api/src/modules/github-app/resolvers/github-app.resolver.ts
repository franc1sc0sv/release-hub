import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Action, Subject } from '@release-hub/shared'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { GithubRepositoryType } from '../../github-auth/types/github-repository.type'
import { GithubInstallResultType } from '../types/github-install-result.type'
import { CompleteGithubInstallationInput } from '../commands/complete-github-installation/complete-github-installation.input'
import { CreateGithubInstallStateCommand } from '../commands/create-github-install-state/create-github-install-state.command'
import { CompleteGithubInstallationCommand } from '../commands/complete-github-installation/complete-github-installation.command'
import { GetInstallationRepositoriesQuery } from '../queries/get-installation-repositories/get-installation-repositories.query'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class GithubAppResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => String)
  @Can(Action.READ, Subject.ORGANIZATION)
  githubInstallUrl(
    @CurrentUser() user: IJwtUser,
    @Args('organizationId', { type: () => String, nullable: true }) organizationId?: string,
    @Args('projectId', { type: () => String, nullable: true }) projectId?: string,
  ): Promise<string> {
    return this.commandBus.execute(
      new CreateGithubInstallStateCommand(user.id, projectId ?? null, organizationId ?? null),
    )
  }

  @Query(() => [GithubRepositoryType])
  @Can(Action.READ, Subject.ORGANIZATION)
  githubInstallationRepositories(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubRepositoryType[]> {
    return this.queryBus.execute(new GetInstallationRepositoriesQuery(user.id, organizationId))
  }

  @Mutation(() => GithubInstallResultType)
  @Can(Action.UPDATE, Subject.ORGANIZATION)
  completeGithubInstallation(
    @Args('input') input: CompleteGithubInstallationInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<GithubInstallResultType> {
    return this.commandBus.execute(
      new CompleteGithubInstallationCommand(user.id, input.installationId, input.state),
    )
  }
}
