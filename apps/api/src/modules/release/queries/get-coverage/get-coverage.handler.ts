import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import type { ICoverage } from '../../interfaces/release.interfaces'
import { GetCoverageQuery } from './get-coverage.query'

@QueryHandler(GetCoverageQuery)
export class GetCoverageHandler extends BaseQueryHandler<GetCoverageQuery, ICoverage> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly releaseRepository: IReleaseRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetCoverageQuery, tx: TxClient): Promise<ICoverage> {
    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

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
