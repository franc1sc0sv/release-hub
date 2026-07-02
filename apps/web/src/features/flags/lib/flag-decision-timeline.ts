import type { ReleaseFlagDecisionType, TrackedFlagQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<TrackedFlagQuery['trackedFlag']>
type FlagRelease = TrackedFlagDetail['releases'][number]
type FlagEvent = TrackedFlagDetail['events'][number]
type DecidedFlagRelease = Omit<FlagRelease, 'decision'> & { decision: ReleaseFlagDecisionType }

export interface FlagDecisionTimelineEntry {
  release: DecidedFlagRelease
  decidedAt: string
}

const DECISION_EVENT_TYPE = 'decision_made'

function hasDecision(release: FlagRelease): release is DecidedFlagRelease {
  return release.decision !== null && release.decision !== undefined
}

export function buildFlagDecisionTimeline(
  releases: FlagRelease[],
  events: FlagEvent[],
): FlagDecisionTimelineEntry[] {
  const decisionEvents = events.filter((event) => event.type === DECISION_EVENT_TYPE)

  return releases
    .filter(hasDecision)
    .map((release) => {
      const matchingEvent = decisionEvents.find((event) =>
        event.description.endsWith(`release ${release.version}`),
      )
      return {
        release,
        decidedAt: matchingEvent?.occurredAt ?? release.date,
      }
    })
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
}
