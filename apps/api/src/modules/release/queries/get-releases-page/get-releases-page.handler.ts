import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleasesPageType } from '../../types/releases-page.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { GetReleasesPageQuery } from './get-releases-page.query'

@QueryHandler(GetReleasesPageQuery)
export class GetReleasesPageHandler extends BaseQueryHandler<GetReleasesPageQuery, ReleasesPageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleasesPageQuery, tx: TxClient): Promise<ReleasesPageType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

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
