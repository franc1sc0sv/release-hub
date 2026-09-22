import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { MemberType } from '../types/member.type'
import { ReceivedInvitationType } from '../types/received-invitation.type'
import { AcceptInvitationCommand } from '../commands/accept-invitation/accept-invitation.command'
import { ListMyInvitationsQuery } from '../queries/list-my-invitations/list-my-invitations.query'
import { toMemberType, toReceivedInvitationType } from '../types/collaboration.mappers'
import type { IMemberProfile, IReceivedInvitation } from '../interfaces/collaboration.interfaces'

@Resolver()
@UseGuards(JwtAuthGuard)
export class AcceptInvitationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [ReceivedInvitationType])
  async myInvitations(@CurrentUser() user: IJwtUser): Promise<ReceivedInvitationType[]> {
    const invitations: IReceivedInvitation[] = await this.queryBus.execute(
      new ListMyInvitationsQuery(user.email),
    )
    return invitations.map(toReceivedInvitationType)
  }

  @Mutation(() => MemberType)
  async acceptInvitation(
    @Args('token', { type: () => String }) token: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<MemberType> {
    const profile: IMemberProfile = await this.commandBus.execute(
      new AcceptInvitationCommand(user.id, user.email, token),
    )
    return toMemberType(profile)
  }
}
