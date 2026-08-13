import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeaturePageType } from '../../types/feature-page.type'
import { toFeatureType } from '../../types/feature.mappers'
import { ListFeaturesPageQuery } from './list-features-page.query'

@QueryHandler(ListFeaturesPageQuery)
export class ListFeaturesPageHandler extends BaseQueryHandler<ListFeaturesPageQuery, FeaturePageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListFeaturesPageQuery, tx: TxClient): Promise<FeaturePageType> {
    await authorizeProjectAction(
      this.orgRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.FEATURE },
      tx,
    )

    const page = await this.featureRepository.findPage(
      {
        projectId: query.projectId,
        limit: query.limit,
        offset: query.offset,
        search: query.search,
        assignableOnly: query.assignableOnly,
      },
      tx,
    )

    return {
      items: page.items.map((feature) => toFeatureType(feature)),
      totalCount: page.totalCount,
      hasMore: page.hasMore,
    }
  }
}
