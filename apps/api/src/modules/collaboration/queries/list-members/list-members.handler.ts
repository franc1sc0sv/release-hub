import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IMembershipRepository } from '../../interfaces/collaboration.repository'
import type { IMemberProfile } from '../../interfaces/collaboration.interfaces'
import { ListMembersQuery } from './list-members.query'

@QueryHandler(ListMembersQuery)
export class ListMembersHandler extends BaseQueryHandler<ListMembersQuery, IMemberProfile[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListMembersQuery, tx: TxClient): Promise<IMemberProfile[]> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: query.actorId,
        organizationId: query.organizationId,
        action: Action.READ,
        subjectKind: Subject.MEMBERSHIP,
      },
      tx,
    )

    return this.membershipRepository.findAllByOrganization(query.organizationId, tx)
  }
}
