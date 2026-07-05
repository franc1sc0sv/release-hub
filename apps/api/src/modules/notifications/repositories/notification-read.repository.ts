import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ReleaseFlagDecisionType, ReleaseStatus } from '@release-hub/db'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import type {
  IProjectSlackConnectionSummary,
  IProjectMemberForNotification,
  IProjectForDigest,
  IStaleFlagCandidate,
  IInProgressFlagSummary,
  IEnabledProdFlagSummary,
  IDeployedReleaseSummary,
  IShipOffReminderCandidate,
} from '../interfaces/notification.interfaces'

const SHIP_OFF_RELEASE_STATUSES: ReleaseStatus[] = [ReleaseStatus.merged, ReleaseStatus.deployed]

const PROD_ENVIRONMENT_NAME_REGEX = /prod/i

@Injectable()
export class NotificationReadRepository extends INotificationReadRepository {
  findSlackConnectionForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IProjectSlackConnectionSummary | null> => {
    const row = await tx.projectSlackConnection.findFirst({ where: { projectId } })
    if (!row) return null
    return {
      id: row.id,
      projectId: row.projectId,
      accessToken: row.accessToken,
      channelId: row.channelId,
      notifyOnCreated: row.notifyOnCreated,
      notifyOnShipped: row.notifyOnShipped,
      notifyOnDeployed: row.notifyOnDeployed,
    }
  }

  findMembersForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IProjectMemberForNotification[]> => {
    const rows = await tx.organizationMembership.findMany({
      where: { organization: { projects: { some: { id: projectId } } }, user: { deletedAt: null } },
      select: { user: { select: { id: true, email: true, name: true } } },
    })
    return rows.map((row) => ({ userId: row.user.id, email: row.user.email, name: row.user.name }))
  }

  findAllActiveProjects = async (tx: TxClient): Promise<IProjectForDigest[]> => {
    const rows = await tx.project.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, flagStaleDays: true, flagReminderIntervalDays: true },
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      flagStaleDays: row.flagStaleDays,
      flagReminderIntervalDays: row.flagReminderIntervalDays,
    }))
  }

  findStaleInProgressFlags = async (
    projectId: string,
    staleDays: number,
    tx: TxClient,
  ): Promise<IStaleFlagCandidate[]> => {
    const staleBefore = new Date()
    staleBefore.setDate(staleBefore.getDate() - staleDays)

    const decisions = await tx.releaseFlagDecision.findMany({
      where: {
        decision: ReleaseFlagDecisionType.in_progress,
        trackedFlag: { projectId, deletedAt: null },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        trackedFlagId: true,
        decidedAt: true,
        updatedAt: true,
        trackedFlag: { select: { id: true, projectId: true, key: true, lastRemindedAt: true } },
      },
    })

    const latestByFlag = new Map<string, (typeof decisions)[number]>()
    for (const decision of decisions) {
      if (!latestByFlag.has(decision.trackedFlagId)) {
        latestByFlag.set(decision.trackedFlagId, decision)
      }
    }

    const candidates: IStaleFlagCandidate[] = []
    for (const decision of latestByFlag.values()) {
      const referenceDate = decision.decidedAt ?? decision.updatedAt
      if (referenceDate > staleBefore) continue

      const { lastRemindedAt } = decision.trackedFlag
      if (lastRemindedAt !== null && lastRemindedAt > staleBefore) continue

      candidates.push({
        trackedFlagId: decision.trackedFlag.id,
        projectId: decision.trackedFlag.projectId,
        key: decision.trackedFlag.key,
        lastRemindedAt,
        decidedAt: decision.decidedAt,
      })
    }

    return candidates
  }

  stampFlagRemindedAt = async (trackedFlagId: string, remindedAt: Date, tx: TxClient): Promise<void> => {
    await tx.trackedFlag.update({ where: { id: trackedFlagId }, data: { lastRemindedAt: remindedAt } })
  }

  findInProgressFlagsForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IInProgressFlagSummary[]> => {
    const decisions = await tx.releaseFlagDecision.findMany({
      where: {
        decision: ReleaseFlagDecisionType.in_progress,
        trackedFlag: { projectId, deletedAt: null },
      },
      orderBy: { updatedAt: 'desc' },
      select: { trackedFlagId: true, trackedFlag: { select: { id: true, key: true } } },
    })

    const seen = new Set<string>()
    const result: IInProgressFlagSummary[] = []
    for (const decision of decisions) {
      if (seen.has(decision.trackedFlagId)) continue
      seen.add(decision.trackedFlagId)
      result.push({ trackedFlagId: decision.trackedFlag.id, key: decision.trackedFlag.key })
    }
    return result
  }

  findEnabledProdFlagsForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IEnabledProdFlagSummary[]> => {
    const environments = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      select: { id: true, name: true },
    })
    const prodEnvironmentIds = environments
      .filter((environment) => PROD_ENVIRONMENT_NAME_REGEX.test(environment.name))
      .map((environment) => environment.id)

    if (prodEnvironmentIds.length === 0) return []

    const states = await tx.flagsmithFlagState.findMany({
      where: { environmentId: { in: prodEnvironmentIds }, enabled: true, flag: { projectId, deletedAt: null } },
      select: { flag: { select: { key: true, trackedFlagId: true } } },
    })

    const seen = new Set<string>()
    const result: IEnabledProdFlagSummary[] = []
    for (const state of states) {
      if (seen.has(state.flag.key)) continue
      seen.add(state.flag.key)
      result.push({ trackedFlagId: state.flag.trackedFlagId, key: state.flag.key })
    }
    return result
  }

  findReleasesDeployedInWindow = async (
    projectId: string,
    since: Date,
    tx: TxClient,
  ): Promise<IDeployedReleaseSummary[]> => {
    const rows = await tx.release.findMany({
      where: { projectId, deletedAt: null, deployedAt: { not: null, gte: since } },
      select: { id: true, projectId: true, name: true, prUrl: true, deployedAt: true },
      orderBy: { deployedAt: 'desc' },
    })
    return rows
      .filter((row): row is typeof row & { deployedAt: Date } => row.deployedAt !== null)
      .map((row) => ({
        releaseId: row.id,
        projectId: row.projectId,
        name: row.name,
        prUrl: row.prUrl,
        deployedAt: row.deployedAt,
      }))
  }

  findShipOffReminderCandidates = async (
    projectId: string,
    reminderIntervalDays: number,
    tx: TxClient,
  ): Promise<IShipOffReminderCandidate[]> => {
    const remindBefore = new Date()
    remindBefore.setDate(remindBefore.getDate() - reminderIntervalDays)

    const decisions = await tx.releaseFlagDecision.findMany({
      where: { trackedFlag: { projectId, deletedAt: null } },
      orderBy: { updatedAt: 'desc' },
      select: {
        trackedFlagId: true,
        decision: true,
        decidedAt: true,
        release: { select: { status: true, deletedAt: true } },
        trackedFlag: {
          select: {
            id: true,
            projectId: true,
            key: true,
            lastRemindedAt: true,
            flagsmithFlags: { select: { states: { select: { enabled: true } } } },
          },
        },
      },
    })

    const latestByFlag = new Map<string, (typeof decisions)[number]>()
    for (const decision of decisions) {
      if (!latestByFlag.has(decision.trackedFlagId)) {
        latestByFlag.set(decision.trackedFlagId, decision)
      }
    }

    const candidates: IShipOffReminderCandidate[] = []
    for (const decision of latestByFlag.values()) {
      if (decision.decision !== ReleaseFlagDecisionType.SHIP_OFF) continue
      if (decision.release.deletedAt !== null) continue
      if (!SHIP_OFF_RELEASE_STATUSES.includes(decision.release.status)) continue

      const { lastRemindedAt } = decision.trackedFlag
      if (lastRemindedAt !== null && lastRemindedAt > remindBefore) continue

      const allStates = decision.trackedFlag.flagsmithFlags.flatMap((flag) => flag.states)
      const stillDisabled = allStates.every((state) => !state.enabled)
      if (!stillDisabled) continue

      candidates.push({
        trackedFlagId: decision.trackedFlag.id,
        projectId: decision.trackedFlag.projectId,
        key: decision.trackedFlag.key,
        lastRemindedAt,
        decidedAt: decision.decidedAt,
      })
    }

    return candidates
  }
}
