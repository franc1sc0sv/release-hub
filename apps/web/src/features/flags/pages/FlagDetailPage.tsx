import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { PageHeader } from '@/components/nebula/PageHeader'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { slideUp } from '@/lib/animations'
import { EnvStateCell } from '../components/EnvStateCell'
import { flagDetailMock } from '../lib/flag-detail.mock'
import type {
  FlagTimelineEvent,
  FlagPullRequestChange,
  FlagReleaseAppearance,
} from '../lib/flag-detail.mock'

interface RolloutRowProps {
  name: string
  enabled: boolean
}

function RolloutRow({ name, enabled }: RolloutRowProps) {
  return (
    <div className="flex items-center gap-2">
      <EnvStateCell enabled={enabled} />
      <span className="font-mono text-sm text-foreground">{name}</span>
    </div>
  )
}

interface TimelineRowProps {
  event: FlagTimelineEvent
  sourceLabel: string
}

function TimelineRow({ event, sourceLabel }: TimelineRowProps) {
  return (
    <li className="relative pb-5 pl-6 last:pb-0">
      <span
        aria-hidden
        className={
          event.isNow
            ? 'absolute left-0 top-1 size-2.5 rounded-full border border-primary bg-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_22%,transparent)]'
            : 'absolute left-0 top-1 size-2.5 rounded-full border border-muted-foreground/50 bg-card'
        }
      />
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-sm text-foreground">{event.title}</p>
        <span className="ml-auto whitespace-nowrap font-mono text-xs text-muted-foreground">
          {event.date}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {event.meta && <span>{event.meta}</span>}
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {sourceLabel}
        </span>
      </div>
    </li>
  )
}

interface ReleaseRowProps {
  release: FlagReleaseAppearance
  statusLabel: string
  metaLabel: string
}

function ReleaseRow({ release, statusLabel, metaLabel }: ReleaseRowProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-medium text-foreground">{release.version}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{metaLabel}</p>
      </div>
      <Badge
        variant="outline"
        className={
          release.status === 'deployed'
            ? 'rounded-full border-status-live/40 bg-status-live/10 text-status-live-fg'
            : 'rounded-full border-status-in-progress/40 bg-status-in-progress/10 text-status-in-progress-fg'
        }
      >
        {statusLabel}
      </Badge>
    </div>
  )
}

interface PullRequestRowProps {
  pr: FlagPullRequestChange
  metaLabel: string
  changeTypeLabel: string
}

function PullRequestRow({ pr, metaLabel, changeTypeLabel }: PullRequestRowProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          <span className="font-mono">#{pr.number}</span> {pr.title}
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{metaLabel}</p>
      </div>
      <Badge
        variant="outline"
        className={
          pr.changeType === 'added'
            ? 'rounded-full border-status-in-progress/40 bg-status-in-progress/10 text-status-in-progress-fg'
            : 'rounded-full border-status-flagged/40 bg-status-flagged/10 text-status-flagged-fg'
        }
      >
        {changeTypeLabel}
      </Badge>
    </div>
  )
}

export default function FlagDetailPage() {
  const { flagKey } = useParams<{ flagKey: string }>()
  const { t } = useTranslation('flagDetail')
  const reduceMotion = useReducedMotion()

  const flag = flagDetailMock
  const effectiveKey = flagKey ?? flag.key

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={slideUp}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-6"
      >
        <nav aria-label={t('breadcrumb.flags')} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Link to={ROUTES.FLAGS} className="hover:text-foreground">
            {t('breadcrumb.flags')}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-foreground">{effectiveKey}</span>
        </nav>

        <PageHeader
          overline={t('overline')}
          title={effectiveKey}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">{t('actions.snooze')}</Button>
              <Button variant="outline">{t('actions.dismiss')}</Button>
              <Button>{t('actions.openInFlagsmith')}</Button>
            </div>
          }
        />

        <div className="space-y-3">
          <p className="max-w-2xl text-sm text-muted-foreground">{flag.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {flag.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full">
                {tag}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className="rounded-full border-status-mismatch/40 bg-status-mismatch/10 text-status-mismatch-fg"
            >
              {flag.statusLabel}
            </Badge>
          </div>
        </div>

        <section
          aria-label={flag.verdict.title}
          className="rounded-[var(--radius-card)] border border-status-flagged/30 bg-[color-mix(in_oklab,var(--status-flagged)_7%,var(--card))] p-5"
        >
          <p className="text-sm font-semibold text-status-flagged-fg">{flag.verdict.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('verdict.subline', {
              version: flag.verdict.subVersion,
              days: flag.verdict.subDays,
              snoozedUntil: flag.verdict.snoozedUntil,
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm">{t('actions.openInFlagsmith')}</Button>
            <Button size="sm" variant="outline">
              {t('actions.setIntendedEnableDate')}
            </Button>
            <Button size="sm" variant="outline">
              {t('actions.markAsIntentional')}
            </Button>
          </div>
        </section>

        <GlassCard>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-display text-base font-semibold">
                {t('currentStatus.title')}
              </CardTitle>
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {t('currentStatus.badge')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('currentStatus.delivery.label')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-foreground">
                  {t('currentStatus.delivery.shippedIn', { version: flag.delivery.version })}
                </span>
                <Badge variant="outline" className="rounded-full font-mono">
                  {t('currentStatus.delivery.inMain', { days: flag.delivery.inMainDays })}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-[110px_1fr]">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('currentStatus.rollout.label')}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {flag.rollout.map((env) => (
                  <RolloutRow key={env.name} name={env.name} enabled={env.state === 'on'} />
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <GlassCard>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-display text-base font-semibold">
                  {t('history.title')}
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    {t('history.count', { count: flag.timeline.length })}
                  </span>
                </CardTitle>
                <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {t('history.filterBadge')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border pl-0">
                {flag.timeline.map((event) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    sourceLabel={t(`history.sources.${event.source}`)}
                  />
                ))}
              </ol>
            </CardContent>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard>
              <CardHeader>
                <CardTitle className="font-display text-base font-semibold">
                  {t('branches.title')}
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    {flag.branches.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flag.branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0"
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full bg-status-live"
                    />
                    <span className="flex-1 font-mono text-sm text-foreground">{branch.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {t('branches.since', { date: branch.since })}
                    </span>
                  </div>
                ))}
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="font-display text-base font-semibold">
                  {t('linkedFeature.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={ROUTES.FEATURES}
                  className="flex items-center gap-3 rounded-[var(--radius-button)] py-1 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium text-foreground">
                    {flag.linkedFeature.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-full border-status-flagged/40 bg-status-flagged/10 text-status-flagged-fg"
                  >
                    {flag.linkedFeature.statusLabel}
                  </Badge>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden />
                </Link>
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
                {flag.releases.map((release) => (
                  <ReleaseRow
                    key={release.version}
                    release={release}
                    statusLabel={t(`releases.status.${release.status}`)}
                    metaLabel={t('releases.meta', {
                      status: t(`releases.status.${release.status}`),
                      date: release.date,
                      prNumber: release.prNumber,
                    })}
                  />
                ))}
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="font-display text-base font-semibold">
                  {t('pullRequests.title')}
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    {flag.pullRequests.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flag.pullRequests.map((pr) => (
                  <PullRequestRow
                    key={pr.number}
                    pr={pr}
                    metaLabel={t('pullRequests.meta', {
                      author: pr.author,
                      date: pr.date,
                      file: pr.file,
                    })}
                    changeTypeLabel={t(`pullRequests.changeType.${pr.changeType}`)}
                  />
                ))}
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </NebulaBackground>
  )
}
