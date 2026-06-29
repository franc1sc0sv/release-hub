import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, ConflictException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IInvitationRepository } from '../../interfaces/collaboration.repository'
import { InvitationStatus } from '../../../../common/types/invitation-status.enum'
import { RevokeInvitationCommand } from './revoke-invitation.command'

@CommandHandler(RevokeInvitationCommand)
export class RevokeInvitationHandler extends BaseCommandHandler<RevokeInvitationCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RevokeInvitationCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    const invitation = await this.invitationRepository.findById(command.invitationId, tx)
    if (!invitation) throw new NotFoundException('Invitation')

    const memberships = await this.projectRepository.findMembershipsForUser(command.actorId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.DELETE, { kind: Subject.INVITATION, __type: Subject.INVITATION, projectId: invitation.projectId })) {
      throw new ForbiddenException()
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException(`Invitation is already ${invitation.status}`)
    }

    await this.invitationRepository.revoke(invitation.id, tx)

    return true
  }
}
