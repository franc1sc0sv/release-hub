import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { ProjectTagType } from '../types/project-tag.type'
import { CreateProjectTagInput } from '../commands/create-project-tag/create-project-tag.input'
import { DeleteProjectTagInput } from '../commands/delete-project-tag/delete-project-tag.input'
import { ListProjectTagsQuery } from '../queries/list-project-tags/list-project-tags.query'
import { CreateProjectTagCommand } from '../commands/create-project-tag/create-project-tag.command'
import { DeleteProjectTagCommand } from '../commands/delete-project-tag/delete-project-tag.command'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ProjectTagResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [ProjectTagType])
  @Can(Action.READ, Subject.PROJECT)
  projectTags(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ProjectTagType[]> {
    return this.queryBus.execute(new ListProjectTagsQuery(projectId, user.id))
  }

  @Mutation(() => ProjectTagType)
  @Can(Action.UPDATE, Subject.PROJECT)
  createProjectTag(
    @Args('input', { type: () => CreateProjectTagInput }) input: CreateProjectTagInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ProjectTagType> {
    return this.commandBus.execute(
      new CreateProjectTagCommand(input.projectId, input.name, input.color ?? null, user.id),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.PROJECT)
  deleteProjectTag(
    @Args('input', { type: () => DeleteProjectTagInput }) input: DeleteProjectTagInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteProjectTagCommand(input.tagId, user.id))
  }
}
