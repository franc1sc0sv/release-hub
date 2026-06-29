import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { Action, Subject } from '@release-hub/shared'
import { FlagsResultType, FlagComparisonResultType } from '../types/flag-ref.type'
import { ConnectionSettingsType } from '../types/connection-settings.type'
import { FlagsmithProjectType } from '../types/flagsmith-project.type'
import { FlagsmithVerifyResult } from '../types/flagsmith-verify-result.type'
import { UpdateConnectionSettingsInput } from '../types/update-connection-settings.input'
import { GetFlagsInput } from '../types/get-flags.input'
import { GetFlagsQuery } from '../queries/get-flags/get-flags.query'
import { CompareFlagsQuery } from '../queries/compare-flags/compare-flags.query'
import { GetConnectionSettingsQuery } from '../queries/get-connection-settings/get-connection-settings.query'
import { GetFlagsmithProjectsQuery } from '../queries/get-flagsmith-projects/get-flagsmith-projects.query'
import { VerifyFlagsmithConnectionQuery } from '../queries/verify-flagsmith-connection/verify-flagsmith-connection.query'
import { UpdateConnectionSettingsCommand } from '../commands/update-connection-settings/update-connection-settings.command'
import { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../common/types/sort-direction.enum'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class IntegrationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => FlagsResultType)
  @Can(Action.READ, Subject.PROJECT)
  getFlags(
    @Args('input', { type: () => GetFlagsInput }) input: GetFlagsInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagsResultType> {
    return this.queryBus.execute(
      new GetFlagsQuery(
        input.projectId,
        user.id,
        input.search,
        input.sortField ?? FlagSortField.CREATED,
        input.sortEnvironment,
        input.sortDirection ?? SortDirection.DESC,
        input.limit ?? 100,
        input.offset ?? 0,
      ),
    )
  }

  @Query(() => FlagComparisonResultType)
  @Can(Action.READ, Subject.PROJECT)
  compareFlags(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('baselineEnvironments', { type: () => [String] }) baselineEnvironments: string[],
    @Args('comparedEnvironments', { type: () => [String] }) comparedEnvironments: string[],
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagComparisonResultType> {
    return this.queryBus.execute(new CompareFlagsQuery(projectId, user.id, baselineEnvironments, comparedEnvironments))
  }

  @Query(() => [FlagsmithProjectType])
  @Can(Action.UPDATE, Subject.PROJECT)
  flagsmithProjects(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('url') url: string,
    @Args('apiKey') apiKey: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagsmithProjectType[]> {
    return this.queryBus.execute(
      new GetFlagsmithProjectsQuery(projectId, user.id, url, apiKey),
    )
  }

  @Query(() => ConnectionSettingsType)
  @Can(Action.READ, Subject.PROJECT)
  getConnectionSettings(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ConnectionSettingsType> {
    return this.queryBus.execute(
      new GetConnectionSettingsQuery(projectId, user.id),
    )
  }

  @Query(() => FlagsmithVerifyResult)
  @Can(Action.UPDATE, Subject.PROJECT)
  verifyFlagsmithConnection(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('url') url: string,
    @Args('apiKey') apiKey: string,
    @Args('flagsmithProjectId') flagsmithProjectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<FlagsmithVerifyResult> {
    return this.queryBus.execute(
      new VerifyFlagsmithConnectionQuery(projectId, user.id, url, apiKey, flagsmithProjectId),
    )
  }

  @Mutation(() => ConnectionSettingsType)
  @Can(Action.UPDATE, Subject.PROJECT)
  updateConnectionSettings(
    @Args('input', { type: () => UpdateConnectionSettingsInput }) input: UpdateConnectionSettingsInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ConnectionSettingsType> {
    return this.commandBus.execute(
      new UpdateConnectionSettingsCommand(
        input.projectId,
        user.id,
        input.flagsmithApiKey,
        input.flagsmithUrl,
        input.flagsmithProjectId,
      ),
    )
  }
}
