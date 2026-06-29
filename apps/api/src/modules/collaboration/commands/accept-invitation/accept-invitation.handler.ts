import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException, ForbiddenException, ConflictException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IMembershipRepository, IInvitationRepository } from '../../interfaces/collaboration.repository'
import type { IMemberProfile } from '../../interfaces/collaboration.interfaces'
import { InvitationStatus } from '../../../../common/types/invitation-status.enum'
import { AcceptInvitationCommand } from './accept-invitation.command'

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler extends BaseCommandHandler<AcceptInvitationCommand, IMemberProfile> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: AcceptInvitationCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IMemberProfile> {
    const invitation = await this.invitationRepository.findByToken(command.token, tx)
    if (!invitation) throw new NotFoundException('Invitation')

    const memberships = await this.projectRepository.findMembershipsForUser(command.actorId, tx)
    const ability = defineAbilityFor(memberships)
    if (!ability.can(Action.UPDATE, { kind: Subject.INVITATION, __type: Subject.INVITATION, projectId: invitation.projectId })) {
      throw new ForbiddenException()
    }

    if (invitation.email.toLowerCase() !== command.actorEmail.toLowerCase()) {
      throw new ForbiddenException()
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      const accepted = await this.membershipRepository.findByProjectAndUser(
        invitation.projectId,
        command.actorId,
        tx,
      )
      if (!accepted) throw new NotFoundException('Membership')
      const acceptedProfile = await this.membershipRepository.findProfileById(accepted.id, tx)
      if (!acceptedProfile) throw new NotFoundException('Membership')
      return acceptedProfile
    }

    if (invitation.status === InvitationStatus.EXPIRED) {
      throw new ConflictException('Invitation has expired')
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException(`Invitation is already ${invitation.status}`)
    }

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepository.markExpired(invitation.id, tx)
      throw new ConflictException('Invitation has expired')
    }

    const existing = await this.membershipRepository.findByProjectAndUser(
      invitation.projectId,
      command.actorId,
      tx,
    )

    const membership =
      existing ??
      (await this.membershipRepository.create(
        command.actorId,
        invitation.projectId,
        invitation.role,
        tx,
      ))

    await this.invitationRepository.accept(invitation.id, tx)

    const profile = await this.membershipRepository.findProfileById(membership.id, tx)
    if (!profile) throw new NotFoundException('Membership')
    return profile
  }
}
