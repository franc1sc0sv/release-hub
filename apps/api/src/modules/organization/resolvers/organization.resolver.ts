import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { Action, Subject } from '@release-hub/shared'
import { OrganizationType } from '../types/organization.type'
import { OrganizationMemberType } from '../types/organization-member.type'
import { CreateOrganizationInput } from '../types/create-organization.input'
import { UpdateOrganizationInput } from '../types/update-organization.input'
import { GetMyOrganizationsQuery } from '../queries/get-my-organizations/get-my-organizations.query'
import { GetOrganizationQuery } from '../queries/get-organization/get-organization.query'
import { ListOrgMembersQuery } from '../queries/list-org-members/list-org-members.query'
import { CreateOrganizationCommand } from '../commands/create-organization/create-organization.command'
import { UpdateOrganizationCommand } from '../commands/update-organization/update-organization.command'
import { DeleteOrganizationCommand } from '../commands/delete-organization/delete-organization.command'

@Resolver(() => OrganizationType)
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class OrganizationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [OrganizationType])
  @Can(Action.READ, Subject.ORGANIZATION)
  myOrganizations(@CurrentUser() user: IJwtUser): Promise<OrganizationType[]> {
    return this.queryBus.execute(new GetMyOrganizationsQuery(user.id))
  }

  @Query(() => OrganizationType)
  @Can(Action.READ, Subject.ORGANIZATION)
  getOrganization(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<OrganizationType> {
    return this.queryBus.execute(new GetOrganizationQuery(user.id, organizationId))
  }

  @Query(() => [OrganizationMemberType])
  @Can(Action.READ, Subject.ORGANIZATION)
  listOrgMembers(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<OrganizationMemberType[]> {
    return this.queryBus.execute(new ListOrgMembersQuery(user.id, organizationId))
  }

  @Mutation(() => OrganizationType)
  @Can(Action.CREATE, Subject.ORGANIZATION)
  createOrganization(
    @Args('input', { type: () => CreateOrganizationInput }) input: CreateOrganizationInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<OrganizationType> {
    return this.commandBus.execute(new CreateOrganizationCommand(user.id, input.name))
  }

  @Mutation(() => OrganizationType)
  @Can(Action.UPDATE, Subject.ORGANIZATION)
  updateOrganization(
    @Args('input', { type: () => UpdateOrganizationInput }) input: UpdateOrganizationInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<OrganizationType> {
    return this.commandBus.execute(
      new UpdateOrganizationCommand(user.id, input.organizationId, input.name),
    )
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.ORGANIZATION)
  deleteOrganization(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteOrganizationCommand(user.id, organizationId))
  }
}
