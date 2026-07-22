import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { m, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  FileText,
  Flag,
  GitCommitHorizontal,
  GitPullRequest,
  Layers,
  Rocket,
  Ticket,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { cn } from '@/lib/utils'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import {
  FeatureKindValue,
  FeatureStateValue,
  FEATURE_STATE_BAR_CLASS,
  featureStateTone,
} from '@/features/features/constants/feature-enums'
import { FlagChangeActionValue } from '../constants/release-enums'
import type { FeatureState, GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

const LIVE_FOR_CLIENT_STATES = new Set<string>([
  FeatureStateValue.LIVE_PROD,
  FeatureStateValue.FULLY_RELEASED,
])

const FLAG_ACTIVITY_ORDER = [
  FlagChangeActionValue.added,
  FlagChangeActionValue.modified,
  FlagChangeActionValue.removed,
] as const

interface ReleaseOverviewProps {
  release: ReleaseNode
  features: FeatureNodes
  onOpenSummary: () => void
}

function featureState(node: FeatureNodes[number]): FeatureState {
  return node.feature.currentState ?? node.state
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <GlassCard>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="text-overline uppercase tracking-widest">{label}</span>
        </div>
        <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
      </CardContent>
    </GlassCard>
  )
}

export function ReleaseOverview({ release, features, onOpenSummary }: ReleaseOverviewProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()

  const stats = useMemo(() => {
    const prs = features.flatMap((node) => node.prs)
    const commits = prs.reduce((sum, pr) => sum + pr.commits.length, 0)
    const tickets = new Set(
      prs.flatMap((pr) => pr.tickets.map((ticket) => `${ticket.source}:${ticket.issueId}`)),
    )
    const flagChanges = prs.flatMap((pr) => pr.flagChanges)

    const stateCounts = new Map<FeatureState, number>()
    for (const node of features) {
      const state = featureState(node)
      stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
    }

    const productNodes = features.filter(
      (node) => node.feature.kind === FeatureKindValue.PRODUCT,
    )
    const liveProductCount = productNodes.filter((node) =>
      LIVE_FOR_CLIENT_STATES.has(featureState(node)),
    ).length

    const flagActivity = FLAG_ACTIVITY_ORDER.map((action) => {
      const keys = new Set(
        flagChanges.filter((change) => change.action === action).map((change) => change.flagKey),
      )
      return { action, keys: [...keys] }
    }).filter((entry) => entry.keys.length > 0)
    const flagChangeCount = flagActivity.reduce((sum, entry) => sum + entry.keys.length, 0)

    return {
      prCount: prs.length,
      featureCount: features.length,
      commitCount: commits,
      ticketCount: tickets.size,
      flagChangeCount,
      stateBreakdown: [...stateCounts.entries()]
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count),
      productCount: productNodes.length,
      liveProductCount,
      flagActivity,
    }
  }, [features])

  const tiles: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: GitPullRequest, label: t('overview.stats.prs'), value: stats.prCount },
    { icon: Layers, label: t('overview.stats.features'), value: stats.featureCount },
    { icon: GitCommitHorizontal, label: t('overview.stats.commits'), value: stats.commitCount },
    { icon: Ticket, label: t('overview.stats.tickets'), value: stats.ticketCount },
    { icon: Flag, label: t('overview.stats.flagChanges'), value: stats.flagChangeCount },
  ]

  const hasSummary =
    (release.summary?.length ?? 0) > 0 && release.summary !== '<p></p>'
  const summaryEditedLabel = release.summaryEditedAt
    ? new Date(release.summaryEditedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const readinessPercent =
    stats.productCount === 0
      ? 0
      : Math.round((stats.liveProductCount / stats.productCount) * 100)

  return (
    <m.div
      variants={staggerContainer}
      initial={reduceMotion ? 'visible' : 'hidden'}
      animate="visible"
      className="space-y-6"
    >
      <m.div
        variants={slideUp}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {tiles.map((tile) => (
          <StatTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} />
        ))}
      </m.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <m.div variants={slideUp}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold text-foreground">
                {t('overview.featureBreakdown.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.featureCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('overview.featureBreakdown.empty')}
                </p>
              ) : (
                <>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                    {stats.stateBreakdown.map(({ state, count }) => (
                      <span
                        key={state}
                        className={cn('h-full', FEATURE_STATE_BAR_CLASS[state])}
                        style={{ width: `${(count / stats.featureCount) * 100}%` }}
                      />
                    ))}
                  </div>
                  <ul className="flex flex-wrap gap-x-4 gap-y-2">
                    {stats.stateBreakdown.map(({ state, count }) => (
                      <li key={state} className="flex items-center gap-2">
                        <StatusBadge tone={featureStateTone(state)}>
                          {enumLabels.featureState(state)}
                        </StatusBadge>
                        <span className="font-mono text-sm tabular-nums text-foreground">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </GlassCard>
        </m.div>

        <m.div variants={slideUp}>
          <GlassCard className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold text-foreground">
                {t('overview.readiness.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Rocket className="size-4 shrink-0" aria-hidden />
                    {t('overview.readiness.liveForClients')}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {t('overview.readiness.fraction', {
                      live: stats.liveProductCount,
                      total: stats.productCount,
                    })}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <span
                    className="block h-full rounded-full bg-emerald-400 transition-[width] duration-500"
                    style={{ width: `${readinessPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/15">
                    <FileText className="size-4 text-indigo-400" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {hasSummary
                        ? t('overview.summary.ready')
                        : t('overview.summary.notReady')}
                    </p>
                    {hasSummary && summaryEditedLabel && (
                      <p className="truncate text-xs text-muted-foreground">
                        {t('overview.summary.lastEdited', { time: summaryEditedLabel })}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onOpenSummary}>
                  {hasSummary ? t('overview.summary.open') : t('overview.summary.create')}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </m.div>
      </div>

      <m.div variants={slideUp}>
        <GlassCard>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold text-foreground">
              {t('overview.flagActivity.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.flagActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('overview.flagActivity.empty')}</p>
            ) : (
              stats.flagActivity.map((entry) => (
                <div key={entry.action} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="flex w-40 shrink-0 items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {enumLabels.flagAction(entry.action)}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {entry.keys.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.keys.map((key) => (
                      <span
                        key={key}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-foreground/70"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </GlassCard>
      </m.div>
    </m.div>
  )
}
