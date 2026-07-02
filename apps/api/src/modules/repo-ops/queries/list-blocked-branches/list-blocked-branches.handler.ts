import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IBlockedBranchRepository, type IBlockedBranch } from '../../interfaces/blocked-branch.repository'
import { ListBlockedBranchesQuery } from './list-blocked-branches.query'

@QueryHandler(ListBlockedBranchesQuery)
export class ListBlockedBranchesHandler extends BaseQueryHandler<
  ListBlockedBranchesQuery,
  IBlockedBranch[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListBlockedBranchesQuery, tx: TxClient): Promise<IBlockedBranch[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    return this.blockedBranchRepository.findAllByProject(query.projectId, tx)
  }
}
