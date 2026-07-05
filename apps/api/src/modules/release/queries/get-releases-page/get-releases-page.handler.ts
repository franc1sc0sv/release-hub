import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleasesPageType } from '../../types/releases-page.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { GetReleasesPageQuery } from './get-releases-page.query'

@QueryHandler(GetReleasesPageQuery)
export class GetReleasesPageHandler extends BaseQueryHandler<GetReleasesPageQuery, ReleasesPageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleasesPageQuery, tx: TxClient): Promise<ReleasesPageType> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const page = await this.releaseRepository.findPageByProject(
      {
        projectId: query.projectId,
        limit: query.limit,
        offset: query.offset,
        search: query.search,
      },
      tx,
    )

    const result = new ReleasesPageType()
    result.items = page.items.map(toReleaseObjectType)
    result.totalCount = page.totalCount
    result.hasMore = page.hasMore
    return result
  }
}
