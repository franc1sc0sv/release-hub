import { useQuery } from '@apollo/client/react'
import { CARRIED_OVER_FLAGS, GET_COVERAGE } from '../graphql/releases.queries'
import { useReleaseFlags } from './useReleaseFlags'
import { FlagChangeActionValue } from '../constants/release-enums'
import { FeatureKindValue, FeatureStateValue } from '@/features/features/constants/feature-enums'
import type { FeatureState, GetReleaseTreeQuery, ReleaseFlagsQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type ReleaseFlag = ReleaseFlagsQuery['releaseFlags'][number]

const LIVE_FOR_CLIENT_STATES = new Set<FeatureState>([
  FeatureStateValue.FULLY_RELEASED,
  FeatureStateValue.COMPLETED,
])

export interface IFeatureStateCount {
  state: FeatureState
  count: number
}

export interface IReleaseWorkspaceStats {
  prCount: number
  featureCount: number
  commitCount: number
  ticketCount: number
  coverage: { assigned: number; total: number; ready: boolean }
  liveProductCount: number
  productCount: number
  stateBreakdown: IFeatureStateCount[]
  releaseFlagCount: number
  openCarryOverCount: number
  flagDecisionsDecided: number
  flagDecisionsTotal: number
  hasSummary: boolean
}

export function isRemovedReleaseFlag(flag: ReleaseFlag): boolean {
  return flag.changes.some((change) => change.action === FlagChangeActionValue.removed)
}

export function needsReleaseFlagDecision(flag: ReleaseFlag): boolean {
  return !isRemovedReleaseFlag(flag) && flag.closedAt === null
}

export function useReleaseWorkspaceStats(
  release: ReleaseNode,
  features: FeatureNodes,
): IReleaseWorkspaceStats {
  const { data: coverageData } = useQuery(GET_COVERAGE, {
    variables: { releaseId: release.id },
    fetchPolicy: 'cache-and-network',
  })
  const { data: carryOverData } = useQuery(CARRIED_OVER_FLAGS, {
    variables: { releaseId: release.id },
    fetchPolicy: 'cache-and-network',
  })
  const { flags } = useReleaseFlags(release.id)

  const acceptedFeatures = features.filter((node) => !node.feature.suggested)
  const prs = features.flatMap((node) => node.prs)
  const tickets = new Set(
    prs.flatMap((pr) => pr.tickets.map((ticket) => `${ticket.source}:${ticket.issueId}`)),
  )

  const stateCounts = new Map<FeatureState, number>()
  for (const node of acceptedFeatures) {
    stateCounts.set(node.state, (stateCounts.get(node.state) ?? 0) + 1)
  }

  const productNodes = acceptedFeatures.filter((node) => node.feature.kind === FeatureKindValue.PRODUCT)
  const carryOver = carryOverData?.carriedOverFlags ?? []
  const decidableFlags = flags.filter(needsReleaseFlagDecision)
  const decidedFlags = decidableFlags.filter((flag) => flag.decision !== null).length
  const decidedCarryOver = carryOver.filter((flag) => flag.decidedInThisRelease).length
  const coverage = coverageData?.getCoverage

  return {
    prCount: prs.length,
    featureCount: acceptedFeatures.length,
    commitCount: prs.reduce((sum, pr) => sum + pr.commits.length, 0),
    ticketCount: tickets.size,
    coverage: {
      assigned: coverage?.assigned ?? 0,
      total: coverage?.total ?? prs.length,
      ready: coverage?.ready ?? false,
    },
    liveProductCount: productNodes.filter((node) => LIVE_FOR_CLIENT_STATES.has(node.state)).length,
    productCount: productNodes.length,
    stateBreakdown: [...stateCounts.entries()]
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    releaseFlagCount: flags.length,
    openCarryOverCount: carryOver.length - decidedCarryOver,
    flagDecisionsDecided: decidedFlags + decidedCarryOver,
    flagDecisionsTotal: decidableFlags.length + carryOver.length,
    hasSummary: (release.summary?.length ?? 0) > 0 && release.summary !== '<p></p>',
  }
}
