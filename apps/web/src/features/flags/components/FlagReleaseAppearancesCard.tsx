import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { releaseStatusTone, releaseFlagDecisionTone } from '@/features/releases/constants/release-enums'
import { ReleaseFlagDecisionSelect } from '@/features/releases/components/ReleaseFlagDecisionSelect'
import type { GetFlagDetailQuery } from '@/generated/graphql'

const DECISION_REFETCH_QUERIES = ['GetFlagDetail', 'GetFlagHistory']

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>
type FlagRelease = TrackedFlagDetail['releases'][number]

interface FlagReleaseRowProps {
  release: FlagRelease
  trackedFlagId: string
}

function FlagReleaseRow({ release, trackedFlagId }: FlagReleaseRowProps) {
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()

  return (
    <li className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <Link
        to={{
          pathname: generatePath(ROUTES.PROJECT_RELEASE_DETAIL, {
            organizationId: organizationId ?? '',
            projectId: projectId ?? '',
            releaseId: release.releaseId,
          }),
          search: '?section=flags',
        }}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-button)] transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>

      <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
        {(canDecide) =>
          canDecide ? (
            <ReleaseFlagDecisionSelect
              releaseId={release.releaseId}
              trackedFlagId={trackedFlagId}
              decision={release.decision}
              refetchQueries={DECISION_REFETCH_QUERIES}
            />
          ) : release.decision ? (
            <StatusBadge tone={releaseFlagDecisionTone(release.decision)}>
              {enumLabels.releaseFlagDecision(release.decision)}
            </StatusBadge>
          ) : null
        }
      </Can>
    </li>
  )
}

interface FlagReleaseAppearancesCardProps {
  releases: FlagRelease[]
  trackedFlagId: string
}

export function FlagReleaseAppearancesCard({
  releases,
  trackedFlagId,
}: FlagReleaseAppearancesCardProps) {
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
              <FlagReleaseRow
                key={release.releaseId}
                release={release}
                trackedFlagId={trackedFlagId}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
