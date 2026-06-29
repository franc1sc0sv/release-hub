import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectType } from '../../types/project.type'
import { toProjectType } from '../../types/project.mappers'
import { GetProjectQuery } from './get-project.query'

@QueryHandler(GetProjectQuery)
export class GetProjectHandler extends BaseQueryHandler<GetProjectQuery, ProjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetProjectQuery, tx: TxClient): Promise<ProjectType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const projectSubject = {
      kind: Subject.PROJECT,
      __type: Subject.PROJECT,
      projectId: query.projectId,
    }
    if (!ability.can(Action.READ, projectSubject)) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)

    if (!project) {
      throw new NotFoundException('Project')
    }

    return toProjectType(project)
  }
}
