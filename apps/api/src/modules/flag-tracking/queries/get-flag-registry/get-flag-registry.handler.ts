import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { FlagRegistryConfigType } from '../../types/flag-registry-config.type'
import { GetFlagRegistryQuery } from './get-flag-registry.query'

@QueryHandler(GetFlagRegistryQuery)
export class GetFlagRegistryHandler extends BaseQueryHandler<GetFlagRegistryQuery, FlagRegistryConfigType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagRegistryQuery, tx: TxClient): Promise<FlagRegistryConfigType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const config = await this.projectRepository.findFlagRegistryConfig(query.projectId, tx)

    const type = new FlagRegistryConfigType()
    type.projectId = query.projectId
    type.flagRegistryPath = config?.flagRegistryPath ?? null
    type.flagRegistryBranch = config?.flagRegistryBranch ?? null
    return type
  }
}
