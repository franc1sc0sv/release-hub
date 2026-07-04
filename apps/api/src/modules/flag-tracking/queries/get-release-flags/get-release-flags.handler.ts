import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ReleaseFlagType } from '../../types/release-flag.type'
import { toReleaseFlagType } from '../../types/flag-tracking.mappers'
import { GetReleaseFlagsQuery } from './get-release-flags.query'

@QueryHandler(GetReleaseFlagsQuery)
export class GetReleaseFlagsHandler extends BaseQueryHandler<GetReleaseFlagsQuery, ReleaseFlagType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseFlagsQuery, tx: TxClient): Promise<ReleaseFlagType[]> {
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
    const prIds = prs.map((pr) => pr.id)

    const changes = await this.pullRequestFlagChangeRepository.findAllForPullRequestIds(prIds, tx)

    const trackedFlagIds = [...new Set(changes.map((change) => change.trackedFlagId))]

    const flags = await this.trackedFlagRepository.findByIdsWithDetails(trackedFlagIds, tx)
    const flagsById = new Map(flags.map((flag) => [flag.id, flag]))

    const decisions = await this.releaseFlagDecisionRepository.findAllForRelease(query.releaseId, tx)
    const decisionsByFlagId = new Map(decisions.map((decision) => [decision.trackedFlagId, decision]))

    const result: ReleaseFlagType[] = []
    for (const trackedFlagId of trackedFlagIds) {
      const flag = flagsById.get(trackedFlagId)
      if (!flag) continue

      const flagChanges = changes.filter((change) => change.trackedFlagId === trackedFlagId)
      const decision = decisionsByFlagId.get(trackedFlagId) ?? null

      result.push(toReleaseFlagType(flag, flagChanges, decision))
    }

    return result
  }
}
