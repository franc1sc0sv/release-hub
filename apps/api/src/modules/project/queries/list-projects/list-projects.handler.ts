import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../interfaces/project.repository'
import { ProjectType } from '../../types/project.type'
import { toProjectType } from '../../types/project.mappers'
import { ListProjectsQuery } from './list-projects.query'

@QueryHandler(ListProjectsQuery)
export class ListProjectsHandler extends BaseQueryHandler<ListProjectsQuery, ProjectType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListProjectsQuery, tx: TxClient): Promise<ProjectType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)

    if (memberships.length === 0) {
      throw new ForbiddenException()
    }

    const projects = await this.projectRepository.findAllForUser(query.userId, tx)
    return projects.map((project) => toProjectType(project))
  }
}
