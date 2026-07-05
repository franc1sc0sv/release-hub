import { CommandHandler } from '@nestjs/cqrs'
import { randomUUID } from 'node:crypto'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ConflictException, NotFoundException } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IAuthRepository } from '../../../auth/repositories/auth.repository.abstract'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IMembershipRepository } from '../../interfaces/collaboration.repository'
import { IInvitationRepository } from '../../interfaces/collaboration.repository'
import type { IInvitation } from '../../interfaces/collaboration.interfaces'
import { ProjectInvitationSentEvent } from '../../events/project-invitation-sent.event'
import { INVITATION_TTL_DAYS } from '../../collaboration.constants'
import { InviteMemberCommand } from './invite-member.command'

@CommandHandler(InviteMemberCommand)
export class InviteMemberHandler extends BaseCommandHandler<InviteMemberCommand, IInvitation> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly authRepository: IAuthRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: InviteMemberCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<IInvitation> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: command.actorId,
        organizationId: command.organizationId,
        action: Action.CREATE,
        subjectKind: Subject.INVITATION,
      },
      tx,
    )

    const organization = await this.organizationRepository.findById(command.organizationId, tx)
    if (!organization) throw new NotFoundException('Organization')

    const actor = await this.authRepository.findById(command.actorId, tx)
    if (!actor) throw new NotFoundException('User')

    const existingMember = await this.membershipRepository.findByOrgAndEmail(
      command.organizationId,
      command.email,
      tx,
    )
    if (existingMember) {
      throw new ConflictException('User is already a member of this organization')
    }

    const existingInvitation = await this.invitationRepository.findPendingByOrgAndEmail(
      command.organizationId,
      command.email,
      tx,
    )
    if (existingInvitation) {
      throw new ConflictException('A pending invitation already exists for this email')
    }

    const ttlDays = INVITATION_TTL_DAYS()
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000)
    const token = randomUUID()

    const invitation = await this.invitationRepository.create(
      {
        email: command.email,
        organizationId: command.organizationId,
        role: command.role,
        invitedById: command.actorId,
        token,
        expiresAt,
      },
      tx,
    )

    events.push(new ProjectInvitationSentEvent(command.email, actor.name, organization.name, token))

    return invitation
  }
}
