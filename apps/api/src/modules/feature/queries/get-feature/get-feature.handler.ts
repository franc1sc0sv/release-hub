import { QueryHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeatureDetailType } from '../../types/feature-detail.type'
import { toFeatureDetailType } from '../../types/feature.mappers'
import { GetFeatureQuery } from './get-feature.query'

@QueryHandler(GetFeatureQuery)
export class GetFeatureHandler extends BaseQueryHandler<GetFeatureQuery, FeatureDetailType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFeatureQuery, tx: TxClient): Promise<FeatureDetailType> {
    const feature = await this.featureRepository.findById(query.featureId, tx)

    if (!feature) {
      throw new NotFoundException()
    }

    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.FEATURE,
        __type: Subject.FEATURE,
        projectId: feature.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const [releases, prs] = await Promise.all([
      this.featureRepository.findReleasesForFeature(query.featureId, tx),
      this.featureRepository.findPullRequestsForFeature(query.featureId, tx),
    ])

    return toFeatureDetailType({ feature, releases, prs })
  }
}
