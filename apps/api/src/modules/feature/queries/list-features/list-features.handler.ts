import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeatureType } from '../../types/feature.type'
import { toFeatureType } from '../../types/feature.mappers'
import { ListFeaturesQuery } from './list-features.query'

@QueryHandler(ListFeaturesQuery)
export class ListFeaturesHandler extends BaseQueryHandler<ListFeaturesQuery, FeatureType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListFeaturesQuery, tx: TxClient): Promise<FeatureType[]> {
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

    const features = await this.featureRepository.findAllByProject(query.projectId, tx)

    return features.map((feature) => toFeatureType(feature))
  }
}
