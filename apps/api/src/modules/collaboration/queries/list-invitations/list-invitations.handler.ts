import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IInvitationRepository } from '../../interfaces/collaboration.repository'
import type { IInvitation } from '../../interfaces/collaboration.interfaces'
import { ListInvitationsQuery } from './list-invitations.query'

@QueryHandler(ListInvitationsQuery)
export class ListInvitationsHandler extends BaseQueryHandler<ListInvitationsQuery, IInvitation[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly invitationRepository: IInvitationRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListInvitationsQuery, tx: TxClient): Promise<IInvitation[]> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: query.actorId,
        organizationId: query.organizationId,
        action: Action.READ,
        subjectKind: Subject.INVITATION,
      },
      tx,
    )

    return this.invitationRepository.findAllByOrganization(query.organizationId, tx)
  }
}
