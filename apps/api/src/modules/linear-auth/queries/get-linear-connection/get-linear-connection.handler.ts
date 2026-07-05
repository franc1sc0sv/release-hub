import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ILinearConnectionRepository } from '../../interfaces/linear-connection.repository'
import type { LinearConnectionStatus } from '../../types/linear-connection-status.type'
import { GetLinearConnectionQuery } from './get-linear-connection.query'

@QueryHandler(GetLinearConnectionQuery)
export class GetLinearConnectionHandler extends BaseQueryHandler<GetLinearConnectionQuery, LinearConnectionStatus> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetLinearConnectionQuery,
    tx: TxClient,
  ): Promise<LinearConnectionStatus> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const connection = await this.linearConnectionRepository.findByProject(query.projectId, tx)
    return {
      connected: project.linearEnabled && connection !== null,
      linearUser: connection?.linearUserName ?? null,
    }
  }
}
