import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IProjectTagRepository } from '../../interfaces/project-tag.repository'
import { ProjectTagType } from '../../types/project-tag.type'
import { ListProjectTagsQuery } from './list-project-tags.query'

@QueryHandler(ListProjectTagsQuery)
export class ListProjectTagsHandler extends BaseQueryHandler<ListProjectTagsQuery, ProjectTagType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListProjectTagsQuery, tx: TxClient): Promise<ProjectTagType[]> {
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

    const tags = await this.projectTagRepository.listByProject(query.projectId, tx)

    return tags.map((tag) => {
      const type = new ProjectTagType()
      type.id = tag.id
      type.name = tag.name
      type.color = tag.color
      type.createdAt = tag.createdAt
      return type
    })
  }
}
