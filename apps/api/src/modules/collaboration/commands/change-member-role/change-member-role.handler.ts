import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject, ProjectRole } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, ConflictException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IMembershipRepository } from '../../interfaces/collaboration.repository'
import type { IMemberProfile } from '../../interfaces/collaboration.interfaces'
import { ChangeMemberRoleCommand } from './change-member-role.command'

@CommandHandler(ChangeMemberRoleCommand)
export class ChangeMemberRoleHandler extends BaseCommandHandler<ChangeMemberRoleCommand, IMemberProfile> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
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

    const memberships = await this.projectRepository.findMembershipsForUser(command.actorId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.UPDATE, { kind: Subject.MEMBERSHIP, __type: Subject.MEMBERSHIP, projectId: membership.projectId })) {
      throw new ForbiddenException()
    }

    if (membership.role === ProjectRole.OWNER && command.newRole !== ProjectRole.OWNER) {
      const ownerCount = await this.membershipRepository.countOwners(membership.projectId, tx)
      if (ownerCount <= 1) {
        throw new ConflictException('Cannot demote the last owner of the project')
      }
    }

    await this.membershipRepository.update(membership.id, { role: command.newRole }, tx)

    const profile = await this.membershipRepository.findProfileById(membership.id, tx)
    if (!profile) throw new NotFoundException('Membership')
    return profile
  }
}
