import { ReleaseFlagDecisionTypeValue } from '@/features/releases/constants/release-enums'
import type { GetFlagDetailQuery, ReleaseFlagDecisionType } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>
export type FlagReleaseAppearance = TrackedFlagDetail['releases'][number]
type DecidedFlagReleaseAppearance = Omit<FlagReleaseAppearance, 'decision'> & {
  decision: ReleaseFlagDecisionType
}

export interface FlagLifecycleStatus {
  decision: ReleaseFlagDecisionType
  release: DecidedFlagReleaseAppearance | null
}

function hasDecision(release: FlagReleaseAppearance): release is DecidedFlagReleaseAppearance {
  return release.decision !== null && release.decision !== undefined
}

export function deriveFlagLifecycleStatus(
  releases: FlagReleaseAppearance[],
): FlagLifecycleStatus {
  const latest = [...releases]
    .filter(hasDecision)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  if (!latest) {
    return { decision: ReleaseFlagDecisionTypeValue.IN_PROGRESS, release: null }
  }

  return { decision: latest.decision, release: latest }
}
