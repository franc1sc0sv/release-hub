import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFeatureRepository } from '../../../feature/interfaces/feature.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
import { ReleaseTreeType, ReleaseFeatureNodeType } from '../../types/release-tree.type'
import { FeatureState } from '../../../../common/types/feature-state.enum'
import { FlagStateType } from '../../../feature/types/flag-state.type'
import { toReleaseObjectType, toPullRequestType } from '../../types/release.mappers'
import { toFeatureType } from '../../../feature/types/feature.mappers'
import { deriveClientAvailability } from '../../../feature/types/client-availability.map'
import type { IFeatureInRelease } from '../../../feature/interfaces/feature.interfaces'
import type { IPullRequest } from '../../interfaces/release.interfaces'
import { GetReleaseTreeQuery } from './get-release-tree.query'

@QueryHandler(GetReleaseTreeQuery)
export class GetReleaseTreeHandler extends BaseQueryHandler<GetReleaseTreeQuery, ReleaseTreeType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseTreeQuery, tx: TxClient): Promise<ReleaseTreeType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(release.projectId, tx)

    const allPrs = await this.pullRequestRepository.findAllByRelease(query.releaseId, tx)
    const assignedPrs = allPrs.filter((pr) => pr.featureId !== null)

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
        const state = ledger?.state ?? FeatureState.IN_PROGRESS
        const flagState = this.toFlagStateType(ledger)
        const node = new ReleaseFeatureNodeType()
        node.feature = toFeatureType(feature)
        node.state = state
        node.clientAvailabilityKey = deriveClientAvailability(state, flagState)
        node.flagState = flagState
        node.prs = (prsByFeatureId.get(feature.id) ?? []).map((pr) => toPullRequestType(pr, project?.repo ?? ''))
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
