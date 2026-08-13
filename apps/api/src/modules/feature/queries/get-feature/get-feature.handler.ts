import { QueryHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
import { IFeatureStateEventRepository } from '../../interfaces/feature-state-event.repository'
import { FeatureDetailType } from '../../types/feature-detail.type'
import { toFeatureDetailType } from '../../types/feature.mappers'
import { GetFeatureQuery } from './get-feature.query'

@QueryHandler(GetFeatureQuery)
export class GetFeatureHandler extends BaseQueryHandler<GetFeatureQuery, FeatureDetailType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly featureStateEventRepository: IFeatureStateEventRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFeatureQuery, tx: TxClient): Promise<FeatureDetailType> {
    const feature = await this.featureRepository.findById(query.featureId, tx)

    if (!feature) {
      throw new NotFoundException()
    }

    await authorizeProjectAction(
      this.orgRepository,
      { actorId: query.userId, projectId: feature.projectId, action: Action.READ, subjectKind: Subject.FEATURE },
      tx,
    )

    const [releases, prs, snapshots, timeline] = await Promise.all([
      this.featureRepository.findReleasesForFeature(query.featureId, tx),
      this.featureRepository.findPullRequestsForFeature(query.featureId, tx),
      this.featureInReleaseRepository.findByFeature(query.featureId, tx),
      this.featureStateEventRepository.findAllByFeature(query.featureId, tx),
    ])

    return toFeatureDetailType({ feature, releases, prs, snapshots, timeline })
  }
}
