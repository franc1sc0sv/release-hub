import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { Action, Subject } from '@release-hub/shared'
import { ProjectType } from '../types/project.type'
import { CreateProjectInput } from '../types/create-project.input'
import { UpdateProjectInput } from '../types/update-project.input'
import { ListProjectsQuery } from '../queries/list-projects/list-projects.query'
import { GetProjectQuery } from '../queries/get-project/get-project.query'
import { CreateProjectCommand } from '../commands/create-project/create-project.command'
import { UpdateProjectCommand } from '../commands/update-project/update-project.command'
import { DeleteProjectCommand } from '../commands/delete-project/delete-project.command'

@Resolver(() => ProjectType)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ProjectResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [ProjectType])
  @Can(Action.READ, Subject.PROJECT)
  listProjects(@CurrentUser() user: IJwtUser): Promise<ProjectType[]> {
    return this.queryBus.execute(new ListProjectsQuery(user.id))
  }

  @Query(() => ProjectType)
  @Can(Action.READ, Subject.PROJECT)
  getProject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<ProjectType> {
    return this.queryBus.execute(new GetProjectQuery(id, user.id))
  }

  @Mutation(() => ProjectType)
  @Can(Action.CREATE, Subject.PROJECT)
  createProject(
    @Args('input', { type: () => CreateProjectInput }) input: CreateProjectInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ProjectType> {
    return this.commandBus.execute(
      new CreateProjectCommand(user.id, input.name, input.repo),
    )
  }

  @Mutation(() => ProjectType)
  @Can(Action.UPDATE, Subject.PROJECT)
  updateProject(
    @Args('input', { type: () => UpdateProjectInput }) input: UpdateProjectInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<ProjectType> {
    return this.commandBus.execute(
      new UpdateProjectCommand(user.id, input.id, input.name, input.repo),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.PROJECT)
  deleteProject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteProjectCommand(user.id, id))
  }
}
