import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeaturePageType } from '../../types/feature-page.type'
import { toFeatureType } from '../../types/feature.mappers'
import { ListFeaturesPageQuery } from './list-features-page.query'

@QueryHandler(ListFeaturesPageQuery)
export class ListFeaturesPageHandler extends BaseQueryHandler<ListFeaturesPageQuery, FeaturePageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListFeaturesPageQuery, tx: TxClient): Promise<FeaturePageType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.FEATURE,
        __type: Subject.FEATURE,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const page = await this.featureRepository.findPage(
      {
        projectId: query.projectId,
        limit: query.limit,
        offset: query.offset,
        search: query.search,
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
