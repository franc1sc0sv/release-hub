import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { FlagAction, ReleaseStatus } from '@release-hub/db'
import { ILinearSyncSourceRepository } from '../interfaces/linear-sync-source.repository'
import type {
  IProductionFlagState,
  ISyncFlag,
  ISyncProject,
  ISyncPullRequest,
  ISyncRelease,
} from '../interfaces/linear-sync.interfaces'
import { isProductionEnvironment } from '../utils/plan-linear-sync'

interface IPullRequestRow {
  id: string
  number: number
  featureId: string | null
  commits: { message: string }[]
}

interface ITrackedFlagRow {
  id: string
  projectId: string
  key: string
  featureId: string | null
  addedInPullRequestId: string | null
  closedReason: ISyncFlag['closedReason']
}

const FLAG_SHIPPING_ACTIONS = [FlagAction.added, FlagAction.modified]

const PULL_REQUEST_SELECT = {
  id: true,
  number: true,
  featureId: true,
  commits: { select: { message: true } },
} as const

const TRACKED_FLAG_SELECT = {
  id: true,
  projectId: true,
  key: true,
  featureId: true,
  addedInPullRequestId: true,
  closedReason: true,
} as const

function toSyncPullRequest(row: IPullRequestRow): ISyncPullRequest {
  return {
    id: row.id,
    number: row.number,
    featureId: row.featureId,
    commitMessages: row.commits.map((commit) => commit.message),
  }
}

@Injectable()
export class LinearSyncSourceRepository extends ILinearSyncSourceRepository {
  findProject = async (projectId: string, tx: TxClient): Promise<ISyncProject | null> =>
    tx.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { id: true, repo: true, linearEnabled: true },
    })

  findDeployedRelease = async (releaseId: string, tx: TxClient): Promise<ISyncRelease | null> => {
    const release = await tx.release.findFirst({
      where: { id: releaseId, deletedAt: null, status: ReleaseStatus.deployed },
      select: {
        id: true,
        projectId: true,
        name: true,
        compareRef: true,
        pullRequests: { select: PULL_REQUEST_SELECT, orderBy: { number: 'asc' } },
      },
    })
    if (!release) return null
    return {
      id: release.id,
      projectId: release.projectId,
      displayName: release.name ?? release.compareRef,
      pullRequests: release.pullRequests.map(toSyncPullRequest),
    }
  }

  findFlagsForRelease = async (releaseId: string, tx: TxClient): Promise<ISyncFlag[]> => {
    const flags = await tx.trackedFlag.findMany({
      where: {
        deletedAt: null,
        OR: [
          { releaseDecisions: { some: { releaseId } } },
          { addedInPullRequest: { releaseId } },
        ],
      },
      select: TRACKED_FLAG_SELECT,
    })
    return Promise.all(flags.map((flag) => this.toSyncFlag(flag, tx)))
  }

  findFlagByKey = async (projectId: string, flagKey: string, tx: TxClient): Promise<ISyncFlag | null> => {
    const flag = await tx.trackedFlag.findFirst({
      where: { projectId, key: flagKey, deletedAt: null },
      select: TRACKED_FLAG_SELECT,
    })
    return flag ? this.toSyncFlag(flag, tx) : null
  }

  private async toSyncFlag(flag: ITrackedFlagRow, tx: TxClient): Promise<ISyncFlag> {
    const deployedRelease = { status: ReleaseStatus.deployed, deletedAt: null }

    const [latestDecision, flagsmithFlags, pullRequests] = await Promise.all([
      tx.releaseFlagDecision.findFirst({
        where: { trackedFlagId: flag.id, release: deployedRelease },
        orderBy: { release: { deployedAt: 'desc' } },
        select: { decision: true },
      }),
      tx.flagsmithFlag.findMany({
        where: { trackedFlagId: flag.id, deletedAt: null },
        select: { states: { select: { enabled: true, environment: { select: { name: true } } } } },
      }),
      tx.pullRequest.findMany({
        where: {
          release: deployedRelease,
          OR: [
            ...(flag.addedInPullRequestId ? [{ id: flag.addedInPullRequestId }] : []),
            { flagChanges: { some: { trackedFlagId: flag.id, action: { in: FLAG_SHIPPING_ACTIONS } } } },
          ],
        },
        select: PULL_REQUEST_SELECT,
      }),
    ])

    const productionStates: IProductionFlagState[] = flagsmithFlags
      .flatMap((flagsmithFlag) => flagsmithFlag.states)
      .filter((state) => isProductionEnvironment(state.environment.name))
      .map((state) => ({ environmentName: state.environment.name, enabled: state.enabled }))

    return {
      id: flag.id,
      key: flag.key,
      closedReason: flag.closedReason,
      latestDecision: latestDecision?.decision ?? null,
      productionStates,
      pullRequests: pullRequests.map(toSyncPullRequest),
    }
  }
}
