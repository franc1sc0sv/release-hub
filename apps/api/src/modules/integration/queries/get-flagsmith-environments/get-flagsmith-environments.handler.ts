import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import { GetFlagsmithEnvironmentsQuery } from './get-flagsmith-environments.query'

@QueryHandler(GetFlagsmithEnvironmentsQuery)
export class GetFlagsmithEnvironmentsHandler extends BaseQueryHandler<GetFlagsmithEnvironmentsQuery, string[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagsmithEnvironmentsQuery, tx: TxClient): Promise<string[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    return this.flagsmithFlagRepository.findEnvironmentNames(query.projectId, tx)
  }
}
