import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { MemberType } from '../types/member.type'
import { AcceptInvitationCommand } from '../commands/accept-invitation/accept-invitation.command'
import { toMemberType } from '../types/collaboration.mappers'
import type { IMemberProfile } from '../interfaces/collaboration.interfaces'

@Resolver()
@UseGuards(JwtAuthGuard)
export class AcceptInvitationResolver {
  constructor(private readonly commandBus: CommandBus) {}

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
