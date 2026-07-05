import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectType } from '../../types/project.type'
import { toProjectType } from '../../types/project.mappers'
import { GetProjectQuery } from './get-project.query'

@QueryHandler(GetProjectQuery)
export class GetProjectHandler extends BaseQueryHandler<GetProjectQuery, ProjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly orgRepository: IOrganizationRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetProjectQuery, tx: TxClient): Promise<ProjectType> {
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

    if (!project) {
      throw new NotFoundException('Project')
    }

    return toProjectType(project)
  }
}
