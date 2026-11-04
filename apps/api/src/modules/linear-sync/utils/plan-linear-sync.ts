import { FlagClosedReason } from '../../../common/types/flag-closed-reason.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'
import {
  FlagProductionState,
  LabelChange,
  LinearStateType,
  StatusMoveOutcome,
  type IFlagLabelPlan,
  type IFlagSignal,
  type IFlagSignalInput,
  type IOpenPullRequestHead,
  type IStatusMoveDecision,
  type IStatusMoveInput,
} from '../interfaces/linear-sync.interfaces'

const PRODUCTION_ENVIRONMENT_NAME_REGEX = /prod(uction)?/i
const TICKET_KEY_REGEX = /\b([A-Z][A-Z0-9]+-\d+)\b/g

export const ARCHIVED_DETAIL = 'Ticket is archived in Linear'

const OFF_DECISIONS: ReadonlySet<ReleaseFlagDecisionType> = new Set([
  ReleaseFlagDecisionType.SHIP_OFF,
  ReleaseFlagDecisionType.IN_PROGRESS,
])

export function isProductionEnvironment(name: string): boolean {
  return PRODUCTION_ENVIRONMENT_NAME_REGEX.test(name)
}

export function extractTicketKeys(commitMessages: string[], teamKeys: ReadonlySet<string>): string[] {
  const keys = new Set<string>()
  for (const message of commitMessages) {
    const subject = message.split(/\r?\n/, 1)[0] ?? ''
    for (const match of subject.toUpperCase().matchAll(TICKET_KEY_REGEX)) {
      const key = match[1]
      const prefix = key?.split('-', 1)[0] ?? ''
      if (key && teamKeys.has(prefix)) keys.add(key)
    }
  }
  return [...keys]
}

export function findOpenPullRequestForTicket(
  ticketKey: string,
  heads: IOpenPullRequestHead[],
  excludedPullRequestNumbers: ReadonlySet<number>,
): number | null {
  const pattern = new RegExp(`(^|[^a-z0-9])${ticketKey.toLowerCase()}([^0-9]|$)`)
  const head = heads.find(
    (candidate) =>
      !excludedPullRequestNumbers.has(candidate.prNumber) && pattern.test(candidate.headRef.toLowerCase()),
  )
  return head ? head.prNumber : null
}

export function decideStatusMove(input: IStatusMoveInput): IStatusMoveDecision {
  const { issue, targetStateName, openPullRequestNumber } = input

  if (!issue) {
    return { outcome: StatusMoveOutcome.NOT_FOUND, detail: 'Ticket not found in Linear' }
  }
  if (issue.state.name === targetStateName) {
    return { outcome: StatusMoveOutcome.ALREADY_THERE, detail: `Already in ${targetStateName}` }
  }
  if (issue.archived) {
    return { outcome: StatusMoveOutcome.ARCHIVED, detail: ARCHIVED_DETAIL }
  }
  if (issue.state.type === LinearStateType.CANCELED) {
    return { outcome: StatusMoveOutcome.CANCELED, detail: `Ticket is ${issue.state.name}` }
  }
  if (issue.state.type === LinearStateType.COMPLETED) {
    return { outcome: StatusMoveOutcome.COMPLETED, detail: `Ticket is already ${issue.state.name}` }
  }
  if (openPullRequestNumber !== null) {
    return { outcome: StatusMoveOutcome.OPEN_PULL_REQUEST, detail: `Open PR #${openPullRequestNumber}` }
  }
  return {
    outcome: StatusMoveOutcome.MOVE,
    detail: `Moved from ${issue.state.name} to ${targetStateName}`,
  }
}

export function resolveFlagSignal(input: IFlagSignalInput): IFlagSignal {
  const { closedReason, latestDecision, productionStates } = input

  if (closedReason === FlagClosedReason.ABANDONED || latestDecision === ReleaseFlagDecisionType.ABANDONED) {
    return { state: FlagProductionState.ABANDONED, enabledEnvironments: [], closedReason }
  }
  if (closedReason !== null) {
    return { state: FlagProductionState.CLOSED, enabledEnvironments: [], closedReason }
  }

  if (productionStates.length > 0) {
    const enabledEnvironments = productionStates
      .filter((state) => state.enabled)
      .map((state) => state.environmentName)
      .sort()
    if (enabledEnvironments.length === productionStates.length) {
      return { state: FlagProductionState.ON, enabledEnvironments, closedReason: null }
    }
    if (enabledEnvironments.length === 0) {
      return { state: FlagProductionState.OFF, enabledEnvironments, closedReason: null }
    }
    return { state: FlagProductionState.PARTIAL, enabledEnvironments, closedReason: null }
  }

  if (latestDecision !== null && OFF_DECISIONS.has(latestDecision)) {
    return { state: FlagProductionState.OFF, enabledEnvironments: [], closedReason: null }
  }
  if (latestDecision === ReleaseFlagDecisionType.ENABLE_IN_RELEASE) {
    return { state: FlagProductionState.ON, enabledEnvironments: [], closedReason: null }
  }
  return { state: FlagProductionState.UNKNOWN, enabledEnvironments: [], closedReason: null }
}

export function planFlagLabel(signal: IFlagSignal, flagKey: string): IFlagLabelPlan | null {
  const flag = `\`${flagKey}\``

  if (signal.state === FlagProductionState.OFF) {
    return {
      labelChange: LabelChange.ADD,
      signature: FlagProductionState.OFF,
      comment: `${flag} is off in production.`,
    }
  }
  if (signal.state === FlagProductionState.ON) {
    return {
      labelChange: LabelChange.REMOVE,
      signature: FlagProductionState.ON,
      comment: `${flag} is on in production.`,
    }
  }
  if (signal.state === FlagProductionState.PARTIAL) {
    const environments = signal.enabledEnvironments.join(', ')
    return {
      labelChange: LabelChange.ADD,
      signature: `${FlagProductionState.PARTIAL}:${environments}`,
      comment: `${flag} is on in ${environments} only. It is still off in the other production environments.`,
    }
  }
  if (signal.state === FlagProductionState.ABANDONED) {
    return {
      labelChange: LabelChange.REMOVE,
      signature: FlagProductionState.ABANDONED,
      comment: `${flag} was abandoned.`,
    }
  }
  if (signal.state === FlagProductionState.CLOSED) {
    const sentence =
      signal.closedReason === FlagClosedReason.REMOVED_FROM_CODE
        ? `${flag} was removed from the code.`
        : `${flag} is fully rolled out.`
    return {
      labelChange: LabelChange.REMOVE,
      signature: `${FlagProductionState.CLOSED}:${signal.closedReason ?? ''}`,
      comment: sentence,
    }
  }
  return null
}

export function statusDedupeKey(releaseId: string, ticketKey: string): string {
  return `status:${releaseId}:${ticketKey}`
}

export function flagDedupeKey(trackedFlagId: string, ticketKey: string): string {
  return `flag:${trackedFlagId}:${ticketKey}`
}
