import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { CheckLinearAuthorizeQuery } from './check-linear-authorize.query'

@QueryHandler(CheckLinearAuthorizeQuery)
export class CheckLinearAuthorizeHandler extends BaseQueryHandler<CheckLinearAuthorizeQuery, void> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: CheckLinearAuthorizeQuery,
    tx: TxClient,
  ): Promise<void> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')
  }
}
