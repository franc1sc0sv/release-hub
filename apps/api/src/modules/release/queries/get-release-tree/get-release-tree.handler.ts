import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../../feature/interfaces/feature.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
import { IPullRequestFlagChangeRepository } from '../../../flag-tracking/interfaces/pull-request-flag-change.repository'
import { ReleaseTreeType, ReleaseFeatureNodeType } from '../../types/release-tree.type'
import { FlagStateType } from '../../../feature/types/flag-state.type'
import { toReleaseObjectType, toPullRequestType } from '../../types/release.mappers'
import { toFeatureType } from '../../../feature/types/feature.mappers'
import { deriveClientAvailability } from '../../../feature/types/client-availability.map'
import { isExcludedFromSummary } from '../../../feature/types/summary-inclusion'
import type { IFeatureInRelease } from '../../../feature/interfaces/feature.interfaces'
import type { IPullRequest } from '../../interfaces/release.interfaces'
import type { IPullRequestFlagChangeWithPullRequest } from '../../../flag-tracking/interfaces/flag-tracking.interfaces'
import { GetReleaseTreeQuery } from './get-release-tree.query'

@QueryHandler(GetReleaseTreeQuery)
export class GetReleaseTreeHandler extends BaseQueryHandler<GetReleaseTreeQuery, ReleaseTreeType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseTreeQuery, tx: TxClient): Promise<ReleaseTreeType> {
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

    const project = await this.projectRepository.findById(release.projectId, tx)

    const allPrs = await this.pullRequestRepository.findAllByRelease(query.releaseId, tx)
    const assignedPrs = allPrs.filter((pr) => pr.featureId !== null)

    const flagChanges = await this.pullRequestFlagChangeRepository.findAllForPullRequestIds(
      assignedPrs.map((pr) => pr.id),
      tx,
    )
    const flagChangesByPullRequestId = flagChanges.reduce<Map<string, IPullRequestFlagChangeWithPullRequest[]>>(
      (acc, change) => {
        const existing = acc.get(change.pullRequestId) ?? []
        existing.push(change)
        acc.set(change.pullRequestId, existing)
        return acc
      },
      new Map(),
    )

    const ledgerEntries = await this.featureInReleaseRepository.findByRelease(query.releaseId, tx)
    const ledgerByFeatureId = new Map<string, IFeatureInRelease>(
      ledgerEntries.map((entry) => [entry.featureId, entry]),
    )

    const featureIds = [...new Set(assignedPrs.map((pr) => pr.featureId as string))]

    const features = await Promise.all(
      featureIds.map((featureId) => this.featureRepository.findById(featureId, tx)),
    )

    const prsByFeatureId = assignedPrs.reduce<Map<string, IPullRequest[]>>((acc, pr) => {
      const featureId = pr.featureId as string
      const existing = acc.get(featureId) ?? []
      existing.push(pr)
      acc.set(featureId, existing)
      return acc
    }, new Map())

    const featureNodes: ReleaseFeatureNodeType[] = features
      .filter((feature): feature is NonNullable<typeof feature> => feature !== null)
      .sort((a, b) => {
        const kindCompare = a.kind.localeCompare(b.kind)
        return kindCompare !== 0 ? kindCompare : a.name.localeCompare(b.name)
      })
      .map((feature) => {
        const ledger = ledgerByFeatureId.get(feature.id)
        const state = ledger?.state ?? feature.state
        const flagState = this.toFlagStateType(ledger)
        const node = new ReleaseFeatureNodeType()
        node.feature = toFeatureType(feature)
        node.state = state
        node.clientAvailabilityKey = deriveClientAvailability(state, flagState)
        node.excludedFromSummary = isExcludedFromSummary(feature.kind, state)
        node.flagState = flagState
        node.prs = (prsByFeatureId.get(feature.id) ?? []).map((pr) =>
          toPullRequestType(pr, project?.repo ?? '', flagChangesByPullRequestId.get(pr.id) ?? []),
        )
        return node
      })

    const tree = new ReleaseTreeType()
    tree.release = toReleaseObjectType(release)
    tree.features = featureNodes
    return tree
  }

  private toFlagStateType(ledger: IFeatureInRelease | undefined): FlagStateType | null {
    if (!ledger?.flagState) return null
    const flagState = new FlagStateType()
    flagState.staging = ledger.flagState.staging
    flagState.production = ledger.flagState.production
    return flagState
  }
}
