import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { releaseStatusTone, releaseFlagDecisionTone } from '@/features/releases/constants/release-enums'
import type { GetFlagDetailQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>
type FlagRelease = TrackedFlagDetail['releases'][number]

interface FlagReleaseRowProps {
  release: FlagRelease
}

function FlagReleaseRow({ release }: FlagReleaseRowProps) {
  const enumLabels = useEnumLabels()

  return (
    <li>
      <Link
        to={{
          pathname: ROUTES.RELEASE_DETAIL.replace(':releaseId', release.releaseId),
          search: '?section=flags',
        }}
        className="flex items-center gap-3 rounded-[var(--radius-button)] border-t border-border py-3 first:border-t-0 first:pt-0 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium text-foreground">{release.version}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge tone={releaseStatusTone(release.status)}>
              {enumLabels.releaseStatus(release.status)}
            </StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              {format(new Date(release.date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        {release.decision && (
          <StatusBadge tone={releaseFlagDecisionTone(release.decision)}>
            {enumLabels.releaseFlagDecision(release.decision)}
          </StatusBadge>
        )}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  )
}

interface FlagReleaseAppearancesCardProps {
  releases: FlagRelease[]
}

export function FlagReleaseAppearancesCard({ releases }: FlagReleaseAppearancesCardProps) {
  const { t } = useTranslation('flags')

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.releases.title')}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {releases.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {releases.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('detail.releases.empty')}
          </p>
        ) : (
          <ul className="space-y-0">
            {releases.map((release) => (
              <FlagReleaseRow key={release.releaseId} release={release} />
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
