import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { OrganizationType } from '../../types/organization.type'
import { toOrganizationType } from '../../types/organization.mappers'
import { GetOrganizationQuery } from './get-organization.query'

@QueryHandler(GetOrganizationQuery)
export class GetOrganizationHandler extends BaseQueryHandler<GetOrganizationQuery, OrganizationType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetOrganizationQuery, tx: TxClient): Promise<OrganizationType> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: query.actorId,
        organizationId: query.organizationId,
        action: Action.READ,
        subjectKind: Subject.ORGANIZATION,
      },
      tx,
    )

    const organization = await this.organizationRepository.findById(query.organizationId, tx)
    if (!organization) throw new NotFoundException('Organization')

    const memberships = await this.organizationRepository.findOrgMembershipsForUser(query.actorId, tx)
    const membership = memberships.find((entry) => entry.organizationId === query.organizationId)
    if (!membership) throw new NotFoundException('Organization')

    const activeInstallationId = await this.organizationRepository.findActiveInstallationIdForOrg(
      query.organizationId,
      tx,
    )

    return toOrganizationType({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: membership.role,
      githubConnected: activeInstallationId !== null,
    })
  }
}
