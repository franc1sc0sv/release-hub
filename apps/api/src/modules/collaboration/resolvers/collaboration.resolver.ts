import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import { Action, Subject } from '@release-hub/shared'
import type { IJwtUser } from '../../../common/types'
import { MemberType } from '../types/member.type'
import { InvitationType } from '../types/invitation.type'
import { InviteMemberInput } from '../types/invite-member.input'
import { UpdateMemberRoleInput } from '../types/update-member-role.input'
import { InviteMemberCommand } from '../commands/invite-member/invite-member.command'
import { RevokeInvitationCommand } from '../commands/revoke-invitation/revoke-invitation.command'
import { RemoveMemberCommand } from '../commands/remove-member/remove-member.command'
import { ChangeMemberRoleCommand } from '../commands/change-member-role/change-member-role.command'
import { ListMembersQuery } from '../queries/list-members/list-members.query'
import { ListInvitationsQuery } from '../queries/list-invitations/list-invitations.query'
import { toMemberType, toInvitationType } from '../types/collaboration.mappers'
import type { IMemberProfile, IInvitation } from '../interfaces/collaboration.interfaces'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class CollaborationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [MemberType])
  @Can(Action.READ, Subject.MEMBERSHIP)
  async listMembers(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<MemberType[]> {
    const members: IMemberProfile[] = await this.queryBus.execute(
      new ListMembersQuery(user.id, projectId),
    )
    return members.map(toMemberType)
  }

  @Query(() => [InvitationType])
  @Can(Action.READ, Subject.INVITATION)
  async listInvitations(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<InvitationType[]> {
    const invitations: IInvitation[] = await this.queryBus.execute(
      new ListInvitationsQuery(user.id, projectId),
    )
    return invitations.map(toInvitationType)
  }

  @Mutation(() => InvitationType)
  @Can(Action.CREATE, Subject.INVITATION)
  async inviteMember(
    @Args('input', { type: () => InviteMemberInput }) input: InviteMemberInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<InvitationType> {
    const invitation: IInvitation = await this.commandBus.execute(
      new InviteMemberCommand(user.id, input.projectId, input.email, input.role),
    )
    return toInvitationType(invitation)
  }

  @Mutation(() => MemberType)
  @Can(Action.UPDATE, Subject.MEMBERSHIP)
  async updateMemberRole(
    @Args('input', { type: () => UpdateMemberRoleInput }) input: UpdateMemberRoleInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<MemberType> {
    const profile: IMemberProfile = await this.commandBus.execute(
      new ChangeMemberRoleCommand(user.id, input.membershipId, input.role),
    )
    return toMemberType(profile)
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.MEMBERSHIP)
  async removeMember(
    @Args('membershipId', { type: () => ID }) membershipId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new RemoveMemberCommand(user.id, membershipId))
  }

  @Mutation(() => Boolean)
  @Can(Action.DELETE, Subject.INVITATION)
  async revokeInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new RevokeInvitationCommand(user.id, invitationId))
  }
}
