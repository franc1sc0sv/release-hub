import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IInvitationRepository } from '../../interfaces/collaboration.repository'
import type { IReceivedInvitation } from '../../interfaces/collaboration.interfaces'
import { ListMyInvitationsQuery } from './list-my-invitations.query'

@QueryHandler(ListMyInvitationsQuery)
export class ListMyInvitationsHandler extends BaseQueryHandler<ListMyInvitationsQuery, IReceivedInvitation[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListMyInvitationsQuery, tx: TxClient): Promise<IReceivedInvitation[]> {
    const invitations = await this.invitationRepository.findActiveForEmail(query.actorEmail, tx)
    const ability = defineAbilityFor()
    return invitations.filter((invitation) =>
      ability.can(Action.UPDATE, {
        kind: Subject.INVITATION,
        __type: Subject.INVITATION,
        organizationId: invitation.organizationId,
      }),
    )
  }
}
