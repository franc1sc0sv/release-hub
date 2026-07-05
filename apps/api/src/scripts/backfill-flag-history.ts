import './load-env'
import { prisma, FlagHistoryEventType, FlagHistorySource, FlagReferenceKind, ReleaseFlagDecisionType } from '@release-hub/db'

const DECISION_HISTORY_EVENT_TYPE: Record<ReleaseFlagDecisionType, FlagHistoryEventType> = {
  [ReleaseFlagDecisionType.ENABLE_IN_RELEASE]: FlagHistoryEventType.decision_enable_in_release,
  [ReleaseFlagDecisionType.SHIP_OFF]: FlagHistoryEventType.decision_ship_off,
  [ReleaseFlagDecisionType.in_progress]: FlagHistoryEventType.decision_in_progress,
}

async function backfillDecisions(): Promise<number> {
  const decisions = await prisma.releaseFlagDecision.findMany({
    include: { trackedFlag: { select: { projectId: true, key: true } } },
  })

  let created = 0
  for (const decision of decisions) {
    const type = DECISION_HISTORY_EVENT_TYPE[decision.decision]

    const existing = await prisma.flagHistoryEvent.findFirst({
      where: { trackedFlagId: decision.trackedFlagId, type, releaseId: decision.releaseId },
      select: { id: true },
    })
    if (existing) continue

    await prisma.flagHistoryEvent.create({
      data: {
        projectId: decision.trackedFlag.projectId,
        flagKey: decision.trackedFlag.key,
        trackedFlagId: decision.trackedFlagId,
        releaseId: decision.releaseId,
        actorId: decision.decidedById,
        type,
        source: FlagHistorySource.user,
        occurredAt: decision.decidedAt ?? decision.createdAt,
      },
    })
    created++
  }
  return created
}

async function backfillPullRequestFlagChanges(): Promise<number> {
  const changes = await prisma.pullRequestFlagChange.findMany({
    include: {
      trackedFlag: { select: { projectId: true, key: true } },
      pullRequest: { select: { number: true } },
    },
  })

  let created = 0
  for (const change of changes) {
    const type =
      change.kind === FlagReferenceKind.DEFINITION
        ? FlagHistoryEventType.detected_definition
        : FlagHistoryEventType.detected_usage

    const existing = await prisma.flagHistoryEvent.findFirst({
      where: {
        trackedFlagId: change.trackedFlagId,
        type,
        prNumber: change.pullRequest.number,
        detectedFile: change.detectedFile,
      },
      select: { id: true },
    })
    if (existing) continue

    await prisma.flagHistoryEvent.create({
      data: {
        projectId: change.trackedFlag.projectId,
        flagKey: change.trackedFlag.key,
        trackedFlagId: change.trackedFlagId,
        prNumber: change.pullRequest.number,
        detectedFile: change.detectedFile,
        type,
        source: FlagHistorySource.system,
        occurredAt: change.createdAt,
      },
    })
    created++
  }
  return created
}

async function backfillBranchPresences(): Promise<number> {
  const presences = await prisma.flagBranchPresence.findMany({
    include: { trackedFlag: { select: { projectId: true, key: true } } },
  })

  let created = 0
  for (const presence of presences) {
    const existing = await prisma.flagHistoryEvent.findFirst({
      where: {
        trackedFlagId: presence.trackedFlagId,
        type: FlagHistoryEventType.first_seen_branch,
        branchName: presence.branch,
      },
      select: { id: true },
    })
    if (existing) continue

    await prisma.flagHistoryEvent.create({
      data: {
        projectId: presence.trackedFlag.projectId,
        flagKey: presence.trackedFlag.key,
        trackedFlagId: presence.trackedFlagId,
        branchName: presence.branch,
        type: FlagHistoryEventType.first_seen_branch,
        source: FlagHistorySource.system,
        occurredAt: presence.firstSeenAt,
      },
    })
    created++
  }
  return created
}

async function main(): Promise<void> {
  const decisionsCreated = await backfillDecisions()
  const changesCreated = await backfillPullRequestFlagChanges()
  const presencesCreated = await backfillBranchPresences()

  console.log(
    `Backfill complete: ${decisionsCreated} decision event(s), ${changesCreated} detection event(s), ${presencesCreated} branch-presence event(s).`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
