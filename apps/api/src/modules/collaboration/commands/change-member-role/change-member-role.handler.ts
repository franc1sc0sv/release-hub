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
import type { IMemberProfile } from '../../interfaces/collaboration.interfaces'
import { ChangeMemberRoleCommand } from './change-member-role.command'

@CommandHandler(ChangeMemberRoleCommand)
export class ChangeMemberRoleHandler extends BaseCommandHandler<ChangeMemberRoleCommand, IMemberProfile> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ChangeMemberRoleCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IMemberProfile> {
    const membership = await this.membershipRepository.findById(command.membershipId, tx)
    if (!membership) throw new NotFoundException('Membership')

    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: command.actorId,
        organizationId: membership.organizationId,
        action: Action.UPDATE,
        subjectKind: Subject.MEMBERSHIP,
      },
      tx,
    )

    if (membership.role === OrgRole.OWNER && command.newRole !== OrgRole.OWNER) {
      const ownerCount = await this.membershipRepository.countOwners(membership.organizationId, tx)
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot demote the last owner of the organization')
      }
    }

    await this.membershipRepository.update(membership.id, { role: command.newRole }, tx)

    const profile = await this.membershipRepository.findProfileById(membership.id, tx)
    if (!profile) throw new NotFoundException('Membership')
    return profile
  }
}
