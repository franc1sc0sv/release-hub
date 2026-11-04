import { describe, expect, it } from 'vitest'
import { FlagClosedReason } from '../../../common/types/flag-closed-reason.enum'
import { ReleaseFlagDecisionType } from '../../../common/types/release-flag-decision-type.enum'
import {
  FlagProductionState,
  LabelChange,
  LinearStateType,
  StatusMoveOutcome,
  type ILinearIssueSnapshot,
} from '../interfaces/linear-sync.interfaces'
import {
  decideStatusMove,
  extractTicketKeys,
  findOpenPullRequestForTicket,
  isProductionEnvironment,
  planFlagLabel,
  resolveFlagSignal,
} from './plan-linear-sync'

const TARGET = 'In Production'
const SAMPLE_FLAG = 'sample_widget'
const OTHER_FLAG = 'other_widget'

function issueIn(name: string, type: string): ILinearIssueSnapshot {
  return {
    id: 'issue-1',
    identifier: 'PURCO-1',
    teamId: 'team-1',
    state: { id: `state-${name}`, name, type },
    labelIds: [],
    archived: false,
  }
}

const TEAM_KEYS: ReadonlySet<string> = new Set(['PURCO'])

describe('extractTicketKeys', () => {
  it('reads keys from the first line of each commit only', () => {
    expect(
      extractTicketKeys([
        'feat(PURCO-3519): split Client Activity clients\n\nRefs PURCO-9999',
        'fix(purco-3523): keep the name',
        'chore: no ticket',
      ], TEAM_KEYS),
    ).toEqual(['PURCO-3519', 'PURCO-3523'])
  })

  it('returns each key once', () => {
    expect(extractTicketKeys(['feat(PURCO-1): a', 'test(PURCO-1): b'], TEAM_KEYS)).toEqual(['PURCO-1'])
  })

  it('ignores keys whose prefix is not a Linear team key', () => {
    expect(extractTicketKeys(['docs(PURCO-3530): add ADR-0049 and glossary', 'fix: UTF-8 names'], TEAM_KEYS)).toEqual([
      'PURCO-3530',
    ])
  })
})

describe('findOpenPullRequestForTicket', () => {
  const heads = [
    { headRef: 'feature/purco-3490-notify-assignees', prNumber: 3420 },
    { headRef: 'feature/purco-34900-other', prNumber: 3500 },
  ]

  it('finds an open PR whose branch names the ticket', () => {
    expect(findOpenPullRequestForTicket('PURCO-3490', heads, new Set())).toBe(3420)
  })

  it('does not match a longer ticket number', () => {
    expect(findOpenPullRequestForTicket('PURCO-349', heads, new Set())).toBeNull()
  })

  it('ignores the pull requests of the release itself', () => {
    expect(findOpenPullRequestForTicket('PURCO-3490', heads, new Set([3420]))).toBeNull()
  })
})

describe('isProductionEnvironment', () => {
  it('matches production environment names', () => {
    expect(isProductionEnvironment('purco-production')).toBe(true)
    expect(isProductionEnvironment('sdi-prod')).toBe(true)
    expect(isProductionEnvironment('purco-staging')).toBe(false)
    expect(isProductionEnvironment('sdi-demo')).toBe(false)
  })
})

describe('decideStatusMove', () => {
  it('moves a ticket that is still in progress', () => {
    expect(
      decideStatusMove({
        issue: issueIn('In Staging', LinearStateType.STARTED),
        targetStateName: TARGET,
        openPullRequestNumber: null,
      }),
    ).toEqual({ outcome: StatusMoveOutcome.MOVE, detail: 'Moved from In Staging to In Production' })
  })

  it('reports a ticket that is not in Linear', () => {
    expect(decideStatusMove({ issue: null, targetStateName: TARGET, openPullRequestNumber: null }).outcome).toBe(
      StatusMoveOutcome.NOT_FOUND,
    )
  })

  it('does nothing when the ticket is already in production', () => {
    expect(
      decideStatusMove({
        issue: issueIn(TARGET, LinearStateType.COMPLETED),
        targetStateName: TARGET,
        openPullRequestNumber: 12,
      }).outcome,
    ).toBe(StatusMoveOutcome.ALREADY_THERE)
  })

  it('never reopens a done or canceled ticket', () => {
    expect(
      decideStatusMove({
        issue: issueIn('Done', LinearStateType.COMPLETED),
        targetStateName: TARGET,
        openPullRequestNumber: null,
      }).outcome,
    ).toBe(StatusMoveOutcome.COMPLETED)
    expect(
      decideStatusMove({
        issue: issueIn('Canceled', LinearStateType.CANCELED),
        targetStateName: TARGET,
        openPullRequestNumber: null,
      }).outcome,
    ).toBe(StatusMoveOutcome.CANCELED)
  })

  it('never moves an archived ticket', () => {
    expect(
      decideStatusMove({
        issue: { ...issueIn('In Progress', LinearStateType.STARTED), archived: true },
        targetStateName: TARGET,
        openPullRequestNumber: null,
      }),
    ).toEqual({ outcome: StatusMoveOutcome.ARCHIVED, detail: 'Ticket is archived in Linear' })
  })

  it('keeps a ticket that still has an open pull request', () => {
    expect(
      decideStatusMove({
        issue: issueIn('Code Review', LinearStateType.STARTED),
        targetStateName: TARGET,
        openPullRequestNumber: 3420,
      }),
    ).toEqual({ outcome: StatusMoveOutcome.OPEN_PULL_REQUEST, detail: 'Open PR #3420' })
  })
})

describe('resolveFlagSignal', () => {
  const prod = (environmentName: string, enabled: boolean) => ({ environmentName, enabled })

  it('is off when every production environment is off', () => {
    expect(
      resolveFlagSignal({
        closedReason: null,
        latestDecision: ReleaseFlagDecisionType.SHIP_OFF,
        productionStates: [prod('purco-production', false), prod('sdi-production', false)],
      }).state,
    ).toBe(FlagProductionState.OFF)
  })

  it('is on when every production environment is on, whatever the decision says', () => {
    expect(
      resolveFlagSignal({
        closedReason: null,
        latestDecision: ReleaseFlagDecisionType.SHIP_OFF,
        productionStates: [prod('purco-production', true), prod('sdi-production', true)],
      }).state,
    ).toBe(FlagProductionState.ON)
  })

  it('is partial and names the environments that are on', () => {
    expect(
      resolveFlagSignal({
        closedReason: null,
        latestDecision: null,
        productionStates: [prod('sdi-production', true), prod('purco-production', false)],
      }),
    ).toEqual({ state: FlagProductionState.PARTIAL, enabledEnvironments: ['sdi-production'], closedReason: null })
  })

  it('falls back to the release decision without Flagsmith data', () => {
    const signal = (latestDecision: ReleaseFlagDecisionType | null) =>
      resolveFlagSignal({ closedReason: null, latestDecision, productionStates: [] }).state
    expect(signal(ReleaseFlagDecisionType.SHIP_OFF)).toBe(FlagProductionState.OFF)
    expect(signal(ReleaseFlagDecisionType.IN_PROGRESS)).toBe(FlagProductionState.OFF)
    expect(signal(ReleaseFlagDecisionType.ENABLE_IN_RELEASE)).toBe(FlagProductionState.ON)
    expect(signal(null)).toBe(FlagProductionState.UNKNOWN)
  })

  it('treats an abandoned decision or closure as abandoned', () => {
    expect(
      resolveFlagSignal({
        closedReason: null,
        latestDecision: ReleaseFlagDecisionType.ABANDONED,
        productionStates: [],
      }).state,
    ).toBe(FlagProductionState.ABANDONED)
    expect(
      resolveFlagSignal({ closedReason: FlagClosedReason.ABANDONED, latestDecision: null, productionStates: [] }).state,
    ).toBe(FlagProductionState.ABANDONED)
  })

  it('treats a flag removed from code as closed even if Flagsmith still has it off', () => {
    expect(
      resolveFlagSignal({
        closedReason: FlagClosedReason.REMOVED_FROM_CODE,
        latestDecision: ReleaseFlagDecisionType.SHIP_OFF,
        productionStates: [prod('purco-production', false)],
      }).state,
    ).toBe(FlagProductionState.CLOSED)
  })
})

describe('planFlagLabel', () => {
  it('adds the label when the flag is off', () => {
    expect(
      planFlagLabel({ state: FlagProductionState.OFF, enabledEnvironments: [], closedReason: null }, SAMPLE_FLAG),
    ).toEqual({ labelChange: LabelChange.ADD, signature: 'off', comment: '`sample_widget` is off in production.' })
  })

  it('removes the label when the flag is on', () => {
    expect(
      planFlagLabel({ state: FlagProductionState.ON, enabledEnvironments: [], closedReason: null }, OTHER_FLAG),
    ).toEqual({ labelChange: LabelChange.REMOVE, signature: 'on', comment: '`other_widget` is on in production.' })
  })

  it('keeps the label and names the tenant when only one production environment is on', () => {
    const plan = planFlagLabel(
      { state: FlagProductionState.PARTIAL, enabledEnvironments: ['sdi-production'], closedReason: null },
      OTHER_FLAG)
    expect(plan?.labelChange).toBe(LabelChange.ADD)
    expect(plan?.signature).toBe('partial:sdi-production')
    expect(plan?.comment).toContain('on in sdi-production only')
  })

  it('gives a different signature for each state so a flag that goes back off is reported again', () => {
    const off = planFlagLabel({ state: FlagProductionState.OFF, enabledEnvironments: [], closedReason: null }, SAMPLE_FLAG)
    const on = planFlagLabel({ state: FlagProductionState.ON, enabledEnvironments: [], closedReason: null }, SAMPLE_FLAG)
    expect(off?.signature).not.toBe(on?.signature)
  })

  it('removes the label when the flag is closed', () => {
    expect(
      planFlagLabel(
        { state: FlagProductionState.CLOSED, enabledEnvironments: [], closedReason: FlagClosedReason.REMOVED_FROM_CODE },
        SAMPLE_FLAG),
    ).toEqual({
      labelChange: LabelChange.REMOVE,
      signature: 'closed:removed_from_code',
      comment: '`sample_widget` was removed from the code.',
    })
  })

  it('does nothing when the state is unknown', () => {
    expect(
      planFlagLabel({ state: FlagProductionState.UNKNOWN, enabledEnvironments: [], closedReason: null }, SAMPLE_FLAG),
    ).toBeNull()
  })
})
