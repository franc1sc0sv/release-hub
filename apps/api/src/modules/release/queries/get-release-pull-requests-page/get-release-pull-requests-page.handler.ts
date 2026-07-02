import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { ReleasePullRequestsPageType } from '../../types/release-pull-requests-page.type'
import { toPullRequestType } from '../../types/release.mappers'
import { GetReleasePullRequestsPageQuery } from './get-release-pull-requests-page.query'

@QueryHandler(GetReleasePullRequestsPageQuery)
export class GetReleasePullRequestsPageHandler extends BaseQueryHandler<
  GetReleasePullRequestsPageQuery,
  ReleasePullRequestsPageType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetReleasePullRequestsPageQuery,
    tx: TxClient,
  ): Promise<ReleasePullRequestsPageType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.READ, {
        kind: Subject.PULL_REQUEST,
        __type: Subject.PULL_REQUEST,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(release.projectId, tx)

    const page = await this.pullRequestRepository.findPageByRelease(
      {
        releaseId: query.releaseId,
        limit: query.limit,
        offset: query.offset,
        search: query.search,
      },
      tx,
    )

    const result = new ReleasePullRequestsPageType()
    result.items = page.items.map((pr) => toPullRequestType(pr, project?.repo ?? ''))
    result.totalCount = page.totalCount
    result.hasMore = page.hasMore
    return result
  }
}
