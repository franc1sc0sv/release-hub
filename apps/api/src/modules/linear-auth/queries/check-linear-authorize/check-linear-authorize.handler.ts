import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { CheckLinearAuthorizeQuery } from './check-linear-authorize.query'

@QueryHandler(CheckLinearAuthorizeQuery)
export class CheckLinearAuthorizeHandler extends BaseQueryHandler<CheckLinearAuthorizeQuery, void> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: CheckLinearAuthorizeQuery,
    tx: TxClient,
  ): Promise<void> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')
  }
}
