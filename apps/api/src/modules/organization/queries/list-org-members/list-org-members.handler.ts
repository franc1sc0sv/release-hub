import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { OrganizationMemberType } from '../../types/organization-member.type'
import { toOrganizationMemberType } from '../../types/organization.mappers'
import { ListOrgMembersQuery } from './list-org-members.query'

@QueryHandler(ListOrgMembersQuery)
export class ListOrgMembersHandler extends BaseQueryHandler<ListOrgMembersQuery, OrganizationMemberType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListOrgMembersQuery, tx: TxClient): Promise<OrganizationMemberType[]> {
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

    const members = await this.organizationRepository.listMembers(query.organizationId, tx)
    return members.map((member) => toOrganizationMemberType(member))
  }
}
