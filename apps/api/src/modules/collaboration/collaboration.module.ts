import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CollaborationResolver } from './resolvers/collaboration.resolver'
import { AcceptInvitationResolver } from './resolvers/accept-invitation.resolver'
import { IMembershipRepository } from './interfaces/collaboration.repository'
import { IInvitationRepository } from './interfaces/collaboration.repository'
import { MembershipRepository } from './repositories/membership.repository'
import { InvitationRepository } from './repositories/invitation.repository'
import { InviteMemberHandler } from './commands/invite-member/invite-member.handler'
import { AcceptInvitationHandler } from './commands/accept-invitation/accept-invitation.handler'
import { RevokeInvitationHandler } from './commands/revoke-invitation/revoke-invitation.handler'
import { RemoveMemberHandler } from './commands/remove-member/remove-member.handler'
import { ChangeMemberRoleHandler } from './commands/change-member-role/change-member-role.handler'
import { ListMembersHandler } from './queries/list-members/list-members.handler'
import { ListInvitationsHandler } from './queries/list-invitations/list-invitations.handler'
import { SendProjectInvitationHandler } from './events/send-project-invitation.handler'
import { MailModule } from '../../common/mail/mail.module'
import { ProjectModule } from '../project/project.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [CqrsModule, MailModule, ProjectModule, AuthModule],
  providers: [
    CollaborationResolver,
    AcceptInvitationResolver,
    { provide: IMembershipRepository, useClass: MembershipRepository },
    { provide: IInvitationRepository, useClass: InvitationRepository },
    InviteMemberHandler,
    AcceptInvitationHandler,
    RevokeInvitationHandler,
    RemoveMemberHandler,
    ChangeMemberRoleHandler,
    ListMembersHandler,
    ListInvitationsHandler,
    SendProjectInvitationHandler,
  ],
})
export class CollaborationModule {}
