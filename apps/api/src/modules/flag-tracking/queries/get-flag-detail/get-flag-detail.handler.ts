import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { FlagDeploymentStatus } from '../../../../common/types/flag-deployment-status.enum'
import { computeFlagDeploymentStatus } from '../../../../common/types/flag-deployment-status.util'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import type { IRelease } from '../../../release/interfaces/release.interfaces'
import { IFlagsmithFlagRepository } from '../../../integration/interfaces/flagsmith-flag.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import type { IReleaseFlagDecision } from '../../interfaces/flag-tracking.interfaces'
import { buildTrackedFlagDetailType } from '../../types/flag-tracking.mappers'
import {
  FlagDetailType,
  FlagDetailFlagsmithType,
  FlagDetailFlagsmithEnvironmentType,
} from '../../types/flag-detail.type'
import type { TrackedFlagDetailType } from '../../types/tracked-flag-detail.type'
import { GetFlagDetailQuery } from './get-flag-detail.query'

@QueryHandler(GetFlagDetailQuery)
export class GetFlagDetailHandler extends BaseQueryHandler<GetFlagDetailQuery, FlagDetailType | null> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagDetailQuery, tx: TxClient): Promise<FlagDetailType | null> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.READ, { kind: Subject.PROJECT, __type: Subject.PROJECT, projectId: query.projectId })) {
      throw new ForbiddenException()
    }

    const flagsmithDetail = await this.flagsmithFlagRepository.findFlagDetailByKey(query.projectId, query.key, tx)
    const trackedFlag = await this.trackedFlagRepository.findByProjectAndKeyWithDetails(
      query.projectId,
      query.key,
      tx,
    )

    if (!flagsmithDetail && !trackedFlag) return null

    let trackedType: TrackedFlagDetailType | null = null
    let latestDecision: IReleaseFlagDecision | null = null

    if (trackedFlag) {
      const changes = await this.pullRequestFlagChangeRepository.findAllForTrackedFlag(trackedFlag.id, tx)
      const releases = await this.releaseRepository.findAllByProject(query.projectId, tx)
      const releasesByPullRequestId = new Map<string, IRelease>()
      for (const change of changes) {
        const release = releases.find((r) => r.id === change.pullRequest.releaseId)
        if (release) releasesByPullRequestId.set(change.pullRequestId, release)
      }

      const relevantReleaseIds = new Set([...releasesByPullRequestId.values()].map((release) => release.id))
      const flagDecisions = await this.releaseFlagDecisionRepository.findAllForTrackedFlag(trackedFlag.id, tx)
      const decisionsByReleaseId = new Map<string, IReleaseFlagDecision>()
      for (const decision of flagDecisions) {
        if (!relevantReleaseIds.has(decision.releaseId)) continue
        decisionsByReleaseId.set(decision.releaseId, decision)
      }

      trackedType = buildTrackedFlagDetailType(trackedFlag, changes, releasesByPullRequestId, decisionsByReleaseId)
      latestDecision = await this.releaseFlagDecisionRepository.findLatestForTrackedFlag(trackedFlag.id, tx)
    }

    const anyDisabled = flagsmithDetail?.environments.some((env) => !env.enabled) ?? false
    const deploymentStatus = computeFlagDeploymentStatus(latestDecision?.decision ?? null, anyDisabled)
    const hasConflict = deploymentStatus === FlagDeploymentStatus.CONFLICT

    const flagsmithType = Object.assign(new FlagDetailFlagsmithType(), {
      exists: flagsmithDetail !== null,
      lastSyncedAt: flagsmithDetail?.lastSyncedAt ?? null,
      environments: (flagsmithDetail?.environments ?? []).map((env) =>
        Object.assign(new FlagDetailFlagsmithEnvironmentType(), env),
      ),
    })

    return Object.assign(new FlagDetailType(), {
      key: flagsmithDetail?.key ?? trackedFlag?.key ?? query.key,
      flagsmith: flagsmithType,
      tracked: trackedType,
      deploymentStatus,
      hasConflict,
    })
  }
}
