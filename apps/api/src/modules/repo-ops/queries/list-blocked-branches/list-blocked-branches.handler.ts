import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IBlockedBranchRepository, type IBlockedBranch } from '../../interfaces/blocked-branch.repository'
import { ListBlockedBranchesQuery } from './list-blocked-branches.query'

@QueryHandler(ListBlockedBranchesQuery)
export class ListBlockedBranchesHandler extends BaseQueryHandler<
  ListBlockedBranchesQuery,
  IBlockedBranch[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListBlockedBranchesQuery, tx: TxClient): Promise<IBlockedBranch[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    return this.blockedBranchRepository.findAllByProject(query.projectId, tx)
  }
}
