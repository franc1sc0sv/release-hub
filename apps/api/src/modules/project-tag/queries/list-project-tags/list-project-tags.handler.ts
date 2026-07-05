import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectTagRepository } from '../../interfaces/project-tag.repository'
import { ProjectTagType } from '../../types/project-tag.type'
import { ListProjectTagsQuery } from './list-project-tags.query'

@QueryHandler(ListProjectTagsQuery)
export class ListProjectTagsHandler extends BaseQueryHandler<ListProjectTagsQuery, ProjectTagType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListProjectTagsQuery, tx: TxClient): Promise<ProjectTagType[]> {
    await authorizeProjectAction(
      this.orgRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

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
