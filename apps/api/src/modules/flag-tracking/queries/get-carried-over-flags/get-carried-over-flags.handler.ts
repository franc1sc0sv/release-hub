import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { FlagDeploymentStatus } from '../../../../common/types/flag-deployment-status.enum'
import { computeFlagDeploymentStatus } from '../../../../common/types/flag-deployment-status.util'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { IFeatureInReleaseRepository } from '../../../release/interfaces/feature-in-release.repository'
import { IFlagsmithFlagRepository } from '../../../integration/interfaces/flagsmith-flag.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { CarriedOverFlagType } from '../../types/carried-over-flag.type'
import { GetCarriedOverFlagsQuery } from './get-carried-over-flags.query'

const CARRIED_OVER_STATUSES: FlagDeploymentStatus[] = [
  FlagDeploymentStatus.IN_PROGRESS,
  FlagDeploymentStatus.SHIPPED_OFF,
  FlagDeploymentStatus.CONFLICT,
]

@QueryHandler(GetCarriedOverFlagsQuery)
export class GetCarriedOverFlagsHandler extends BaseQueryHandler<
  GetCarriedOverFlagsQuery,
  CarriedOverFlagType[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetCarriedOverFlagsQuery,
    tx: TxClient,
  ): Promise<CarriedOverFlagType[]> {
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

    const decisions = await this.releaseFlagDecisionRepository.findLatestDecisionsForProject(
      release.projectId,
      tx,
    )
    if (decisions.length === 0) return []

    const prs = await this.pullRequestRepository.findAllByRelease(query.releaseId, tx)
    const changes = await this.pullRequestFlagChangeRepository.findAllForPullRequestIds(
      prs.map((pr) => pr.id),
      tx,
    )
    const flagIdsInThisRelease = new Set(changes.map((change) => change.trackedFlagId))

    const project = await this.projectRepository.findById(release.projectId, tx)
    const watchedEnvironments = project?.conflictEnvironments ?? []

    const states = await this.flagsmithFlagRepository.findEnabledStatesForKeys(
      release.projectId,
      decisions.map((decision) => decision.key),
      tx,
    )

    const disabledByKey = new Map<string, boolean>()
    for (const state of states) {
      if (watchedEnvironments.length > 0 && !watchedEnvironments.includes(state.environmentName)) {
        continue
      }
      disabledByKey.set(state.key, (disabledByKey.get(state.key) ?? false) || !state.enabled)
    }

    const featureStates = await this.featureInReleaseRepository.findByRelease(query.releaseId, tx)
    const stateByFeatureId = new Map(featureStates.map((row) => [row.featureId, row.state]))

    const results: CarriedOverFlagType[] = []
    for (const decision of decisions) {
      if (flagIdsInThisRelease.has(decision.trackedFlagId)) continue

      const decidedInThisRelease = decision.releaseId === query.releaseId
      const deploymentStatus = computeFlagDeploymentStatus(
        decision.decision,
        disabledByKey.get(decision.key) ?? false,
      )
      if (!decidedInThisRelease && !CARRIED_OVER_STATUSES.includes(deploymentStatus)) continue

      const originRelease = await this.releaseRepository.findById(decision.releaseId, tx)
      if (!originRelease) continue

      const carried = new CarriedOverFlagType()
      carried.trackedFlagId = decision.trackedFlagId
      carried.key = decision.key
      carried.featureId = decision.featureId
      carried.featureName = decision.featureName
      carried.originReleaseId = decision.releaseId
      carried.originReleaseName = originRelease.name ?? originRelease.compareRef
      carried.decision = decision.decision
      carried.deploymentStatus = deploymentStatus
      carried.decidedAt = decision.decidedAt
      carried.decidedInThisRelease = decidedInThisRelease
      carried.featureReleaseState = decision.featureId
        ? (stateByFeatureId.get(decision.featureId) ?? null)
        : null
      results.push(carried)
    }

    return results
  }
}
