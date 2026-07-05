import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject, OrgRole } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException, ConflictException } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IMembershipRepository } from '../../interfaces/collaboration.repository'
import { RemoveMemberCommand } from './remove-member.command'

@CommandHandler(RemoveMemberCommand)
export class RemoveMemberHandler extends BaseCommandHandler<RemoveMemberCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RemoveMemberCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    const membership = await this.membershipRepository.findById(command.membershipId, tx)
    if (!membership) throw new NotFoundException('Membership')

    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: command.actorId,
        organizationId: membership.organizationId,
        action: Action.DELETE,
        subjectKind: Subject.MEMBERSHIP,
      },
      tx,
    )

    if (membership.role === OrgRole.OWNER) {
      const ownerCount = await this.membershipRepository.countOwners(membership.organizationId, tx)
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot remove the last owner of the organization')
      }
    }

    await this.membershipRepository.delete(membership.id, tx)

    return true
  }
}
