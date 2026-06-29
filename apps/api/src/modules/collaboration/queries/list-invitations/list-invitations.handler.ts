import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IInvitationRepository } from '../../interfaces/collaboration.repository'
import type { IInvitation } from '../../interfaces/collaboration.interfaces'
import { ListInvitationsQuery } from './list-invitations.query'

@QueryHandler(ListInvitationsQuery)
export class ListInvitationsHandler extends BaseQueryHandler<ListInvitationsQuery, IInvitation[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListInvitationsQuery, tx: TxClient): Promise<IInvitation[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.actorId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.READ, { kind: Subject.INVITATION, __type: Subject.INVITATION, projectId: query.projectId })) {
      throw new ForbiddenException()
    }

    return this.invitationRepository.findAllByProject(query.projectId, tx)
  }
}
