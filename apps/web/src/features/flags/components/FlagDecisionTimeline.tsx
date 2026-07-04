import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { releaseFlagDecisionTone } from '@/features/releases/constants/release-enums'
import { buildFlagDecisionTimeline } from '../lib/flag-decision-timeline'
import type { GetFlagDetailQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>

interface FlagDecisionTimelineProps {
  releases: TrackedFlagDetail['releases']
  events: TrackedFlagDetail['events']
}

export function FlagDecisionTimeline({ releases, events }: FlagDecisionTimelineProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()

  const timeline = buildFlagDecisionTimeline(releases, events)

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.decisionTimeline.title')}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {timeline.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('detail.decisionTimeline.empty')}
          </p>
        ) : (
          <ol className="space-y-0">
            {timeline.map((entry) => (
              <li
                key={entry.release.releaseId}
                className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0"
              >
                <StatusBadge tone={releaseFlagDecisionTone(entry.release.decision)}>
                  {enumLabels.releaseFlagDecision(entry.release.decision)}
                </StatusBadge>
                <Link
                  to={{
                    pathname: ROUTES.RELEASE_DETAIL.replace(':releaseId', entry.release.releaseId),
                    search: '?section=flags',
                  }}
                  className="min-w-0 flex-1 truncate font-mono text-sm text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {entry.release.version}
                </Link>
                <time
                  dateTime={entry.decidedAt}
                  className="whitespace-nowrap font-mono text-xs text-muted-foreground"
                >
                  {format(new Date(entry.decidedAt), 'MMM d, yyyy HH:mm')}
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </GlassCard>
  )
}
