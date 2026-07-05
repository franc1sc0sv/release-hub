import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import type { IRelease } from '../../../release/interfaces/release.interfaces'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import type { IReleaseFlagDecision } from '../../interfaces/flag-tracking.interfaces'
import { TrackedFlagDetailType } from '../../types/tracked-flag-detail.type'
import { buildTrackedFlagDetailType } from '../../types/flag-tracking.mappers'
import { GetTrackedFlagDetailQuery } from './get-tracked-flag-detail.query'

@QueryHandler(GetTrackedFlagDetailQuery)
export class GetTrackedFlagDetailHandler extends BaseQueryHandler<GetTrackedFlagDetailQuery, TrackedFlagDetailType | null> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetTrackedFlagDetailQuery, tx: TxClient): Promise<TrackedFlagDetailType | null> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const flag = await this.trackedFlagRepository.findByProjectAndKeyWithDetails(query.projectId, query.key, tx)
    if (!flag) return null

    const changes = await this.pullRequestFlagChangeRepository.findAllForTrackedFlag(flag.id, tx)

    const releases = await this.releaseRepository.findAllByProject(query.projectId, tx)
    const releasesByPullRequestId = new Map<string, IRelease>()
    for (const change of changes) {
      const release = releases.find((r) => r.id === change.pullRequest.releaseId)
      if (release) releasesByPullRequestId.set(change.pullRequestId, release)
    }

    const relevantReleaseIds = new Set([...releasesByPullRequestId.values()].map((release) => release.id))
    const flagDecisions = await this.releaseFlagDecisionRepository.findAllForTrackedFlag(flag.id, tx)
    const decisionsByReleaseId = new Map<string, IReleaseFlagDecision>()
    for (const decision of flagDecisions) {
      if (!relevantReleaseIds.has(decision.releaseId)) continue
      decisionsByReleaseId.set(decision.releaseId, decision)
    }

    return buildTrackedFlagDetailType(flag, changes, releasesByPullRequestId, decisionsByReleaseId)
  }
}
