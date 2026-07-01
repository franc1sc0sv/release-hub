import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { AlertCircle, ChevronRight, Loader2, Flag as FlagIcon } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { PageHeader } from '@/components/nebula/PageHeader'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useProject } from '@/context/project.context'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { slideUp } from '@/lib/animations'
import { TRACKED_FLAG } from '../graphql/flags.queries'
import { useRunFlagCoverageForFlag } from '../hooks/use-run-flag-coverage-for-flag'
import type {
  TrackedFlagQuery,
  TrackedFlagDeliveryType,
} from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<TrackedFlagQuery['trackedFlag']>
type FlagEvent = TrackedFlagDetail['events'][number]
type FlagBranchPresence = TrackedFlagDetail['branchPresences'][number]
type FlagRelease = TrackedFlagDetail['releases'][number]
type FlagPullRequestChange = TrackedFlagDetail['pullRequestChanges'][number]

interface TimelineRowProps {
  event: FlagEvent
}

function TimelineRow({ event }: TimelineRowProps) {
  return (
    <li className="relative pb-5 pl-6 last:pb-0">
      <span
        aria-hidden
        className="absolute left-0 top-1 size-2.5 rounded-full border border-muted-foreground/50 bg-card"
      />
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-sm text-foreground">{event.description}</p>
        <span className="ml-auto whitespace-nowrap font-mono text-xs text-muted-foreground">
          {format(new Date(event.occurredAt), 'MMM d, yyyy')}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {event.type}
        </span>
      </div>
    </li>
  )
}

interface BranchRowProps {
  branch: FlagBranchPresence
}

function BranchRow({ branch }: BranchRowProps) {
  const { t } = useTranslation('flagDetail')

  return (
    <div className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span
        aria-hidden
        className={
          branch.present
            ? 'size-2.5 shrink-0 rounded-full bg-status-live'
            : 'size-2.5 shrink-0 rounded-full border border-muted-foreground/40'
        }
      />
      <span className="flex-1 font-mono text-sm text-foreground">{branch.branch}</span>
      <span className="font-mono text-xs text-muted-foreground">
        {t('branches.since', { date: format(new Date(branch.firstSeenAt), 'MMM d, yyyy') })}
      </span>
    </div>
  )
}

interface ReleaseRowProps {
  release: FlagRelease
  statusLabel: string
  decisionLabel: string | null
}

function ReleaseRow({ release, statusLabel, decisionLabel }: ReleaseRowProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-medium text-foreground">{release.version}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {statusLabel} · {format(new Date(release.date), 'MMM d, yyyy')}
        </p>
      </div>
      {decisionLabel && (
        <Badge variant="outline" className="rounded-full">
          {decisionLabel}
        </Badge>
      )}
    </div>
  )
}

interface PullRequestRowProps {
  pr: FlagPullRequestChange
  changeTypeLabel: string
  kindLabel: string
}

function PullRequestRow({ pr, changeTypeLabel, kindLabel }: PullRequestRowProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          <span className="font-mono">#{pr.prNumber}</span> {pr.prTitle}
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {pr.prAuthor} · {format(new Date(pr.prMergedAt), 'MMM d, yyyy')}
          {pr.detectedFile ? ` · ${pr.detectedFile}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge
          variant="outline"
          className="rounded-full border-status-flagged/40 bg-status-flagged/10 text-status-flagged-fg"
        >
          {changeTypeLabel}
        </Badge>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {kindLabel}
        </span>
      </div>
    </div>
  )
}

interface DeliveryBadgeProps {
  delivery: TrackedFlagDeliveryType
}

function DeliveryBadge({ delivery }: DeliveryBadgeProps) {
  const { t } = useTranslation('flagDetail')

  if (delivery.shippedReleaseVersions.length === 0) {
    return (
      <Badge variant="outline" className="rounded-full font-mono">
        {t('currentStatus.delivery.notShipped')}
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-foreground">
        {t('currentStatus.delivery.shippedIn', {
          version: delivery.shippedReleaseVersions.join(', '),
        })}
      </span>
      {delivery.inDefaultBranch && (
        <Badge variant="outline" className="rounded-full font-mono">
          {t('currentStatus.delivery.inDefaultBranch')}
        </Badge>
      )}
    </div>
  )
}

interface RunCoverageButtonProps {
  projectId: string
  flagKey: string
}

function RunCoverageButton({ projectId, flagKey }: RunCoverageButtonProps) {
  const { t } = useTranslation('flagDetail')
  const { run, loading } = useRunFlagCoverageForFlag(projectId, flagKey)

  async function handleRun(): Promise<void> {
    try {
      await run()
      toast.success(t('coverage.success'))
    } catch {
      toast.error(t('coverage.error'))
    }
  }

  return (
    <Can I={Action.UPDATE} a={Subject.PROJECT}>
      <Button variant="outline" disabled={loading} onClick={() => void handleRun()}>
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {t('coverage.button')}
      </Button>
    </Can>
  )
}

export default function FlagDetailPage() {
  const { flagKey } = useParams<{ flagKey: string }>()
  const { t } = useTranslation('flagDetail')
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()
  const enumLabels = useEnumLabels()

  const projectId = activeProject?.id ?? ''

  const { data, loading, error } = useQuery(TRACKED_FLAG, {
    variables: { projectId, key: flagKey ?? '' },
    skip: !projectId || !flagKey,
    fetchPolicy: 'cache-and-network',
  })

  const flag = data?.trackedFlag

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={slideUp}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-6"
      >
        <nav
          aria-label={t('breadcrumb.flags')}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
        >
          <Link to={ROUTES.FLAGS} className="hover:text-foreground">
            {t('breadcrumb.flags')}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-foreground">{flagKey}</span>
        </nav>

        <PageHeader
          overline={t('overline')}
          title={flagKey ?? ''}
          actions={
            projectId && flagKey ? (
              <RunCoverageButton projectId={projectId} flagKey={flagKey} />
            ) : undefined
          }
        />

        {loading && !data && (
          <GlassCard>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="size-10 animate-spin text-brand-indigo-bright" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </CardContent>
          </GlassCard>
        )}

        {error && !loading && (
          <GlassCard>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
                <AlertCircle className="size-7 text-destructive" aria-hidden />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-foreground">
                  {t('error.heading')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t('error.description')}</p>
              </div>
            </CardContent>
          </GlassCard>
        )}

        {!loading && !error && !flag && (
          <EmptyState
            icon={<FlagIcon className="size-7 text-brand-indigo-bright" aria-hidden />}
            heading={t('notFound.heading')}
            description={t('notFound.description')}
          />
        )}

        {flag && (
          <>
            <GlassCard>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-display text-base font-semibold">
                    {t('currentStatus.title')}
                  </CardTitle>
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {flag.presentInCode
                      ? t('currentStatus.presentInCode')
                      : t('currentStatus.notPresentInCode')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('currentStatus.delivery.label')}
                  </p>
                  <DeliveryBadge delivery={flag.delivery} />
                </div>
              </CardContent>
            </GlassCard>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="font-display text-base font-semibold">
                    {t('history.title')}
                    <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                      {t('history.count', { count: flag.events.length })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flag.events.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {t('history.empty')}
                    </p>
                  ) : (
                    <ol className="relative border-l border-border pl-0">
                      {flag.events.map((event, index) => (
                        <TimelineRow key={`${event.type}-${event.occurredAt}-${index}`} event={event} />
                      ))}
                    </ol>
                  )}
                </CardContent>
              </GlassCard>

              <div className="space-y-4">
                <GlassCard>
                  <CardHeader>
                    <CardTitle className="font-display text-base font-semibold">
                      {t('branches.title')}
                      <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                        {flag.branchPresences.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {flag.branchPresences.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        {t('branches.empty')}
                      </p>
                    ) : (
                      flag.branchPresences.map((branch) => (
                        <BranchRow key={branch.branch} branch={branch} />
                      ))
                    )}
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardHeader>
                    <CardTitle className="font-display text-base font-semibold">
                      {t('linkedFeature.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {flag.feature ? (
                      <Link
                        to={ROUTES.FEATURES_DETAIL.replace(':id', flag.feature.id)}
                        className="flex items-center gap-3 rounded-[var(--radius-button)] py-1 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {flag.feature.name}
                        </span>
                        <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('linkedFeature.empty')}</p>
                    )}
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardHeader>
                    <CardTitle className="font-display text-base font-semibold">
                      {t('releases.title')}
                      <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                        {flag.releases.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {flag.releases.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        {t('releases.empty')}
                      </p>
                    ) : (
                      flag.releases.map((release) => (
                        <ReleaseRow
                          key={release.releaseId}
                          release={release}
                          statusLabel={enumLabels.releaseStatus(release.status)}
                          decisionLabel={
                            release.decision ? enumLabels.releaseFlagDecision(release.decision) : null
                          }
                        />
                      ))
                    )}
                  </CardContent>
                </GlassCard>

                <GlassCard>
                  <CardHeader>
                    <CardTitle className="font-display text-base font-semibold">
                      {t('pullRequests.title')}
                      <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                        {flag.pullRequestChanges.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {flag.pullRequestChanges.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        {t('pullRequests.empty')}
                      </p>
                    ) : (
                      flag.pullRequestChanges.map((pr) => (
                        <PullRequestRow
                          key={`${pr.prNumber}-${pr.kind}`}
                          pr={pr}
                          changeTypeLabel={enumLabels.flagAction(pr.action)}
                          kindLabel={enumLabels.flagReferenceKind(pr.kind)}
                        />
                      ))
                    )}
                  </CardContent>
                </GlassCard>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </NebulaBackground>
  )
}
