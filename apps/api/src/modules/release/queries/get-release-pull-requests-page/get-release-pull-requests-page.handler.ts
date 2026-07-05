import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
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
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetReleasePullRequestsPageQuery,
    tx: TxClient,
  ): Promise<ReleasePullRequestsPageType> {
    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: release.projectId,
        action: Action.READ,
        subjectKind: Subject.PULL_REQUEST,
      },
      tx,
    )

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
