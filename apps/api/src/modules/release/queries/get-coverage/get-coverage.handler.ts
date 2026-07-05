import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import type { ICoverage } from '../../interfaces/release.interfaces'
import { GetCoverageQuery } from './get-coverage.query'

@QueryHandler(GetCoverageQuery)
export class GetCoverageHandler extends BaseQueryHandler<GetCoverageQuery, ICoverage> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly releaseRepository: IReleaseRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetCoverageQuery, tx: TxClient): Promise<ICoverage> {
    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: query.userId,
        projectId: release.projectId,
        action: Action.READ,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const prs = await this.pullRequestRepository.findAllByRelease(query.releaseId, tx)
    const total = prs.length
    const assigned = prs.filter((pr) => pr.featureId !== null).length

    return {
      total,
      assigned,
      ready: total > 0 && assigned === total,
    }
  }
}
