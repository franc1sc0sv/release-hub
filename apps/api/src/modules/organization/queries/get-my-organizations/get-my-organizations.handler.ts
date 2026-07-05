import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { OrganizationType } from '../../types/organization.type'
import { toOrganizationType } from '../../types/organization.mappers'
import { GetMyOrganizationsQuery } from './get-my-organizations.query'

@QueryHandler(GetMyOrganizationsQuery)
export class GetMyOrganizationsHandler extends BaseQueryHandler<GetMyOrganizationsQuery, OrganizationType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetMyOrganizationsQuery, tx: TxClient): Promise<OrganizationType[]> {
    const organizations = await this.organizationRepository.findOrganizationsForUser(query.userId, tx)
    return organizations.map((organization) => toOrganizationType(organization))
  }
}
