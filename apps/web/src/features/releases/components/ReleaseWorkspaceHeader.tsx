import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReleaseStatusControl } from './ReleaseStatusControl'
import { SyncNewPrsButton } from './SyncNewPrsButton'
import { DeleteReleaseButton } from './DeleteReleaseButton'
import { ConfirmReleaseButton } from './ConfirmReleaseButton'
import { ReleaseStatusValue } from '../constants/release-enums'
import type { IReleaseWorkspaceStats } from '../hooks/useReleaseWorkspaceStats'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']

interface HeaderMetricProps {
  label: string
  value: string
  highlight?: 'good' | 'attention'
}

function HeaderMetric({ label, value, highlight }: HeaderMetricProps) {
  return (
    <div className="min-w-0">
      <dt className="text-overline uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'font-mono text-xl tabular-nums text-foreground',
          highlight === 'good' && 'text-emerald-300',
          highlight === 'attention' && 'text-amber-300',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

interface ReleaseWorkspaceHeaderProps {
  release: ReleaseNode
  stats: IReleaseWorkspaceStats
  projectId: string
  releasesPath: string
  onDeleted: () => void
}

export function ReleaseWorkspaceHeader({
  release,
  stats,
  projectId,
  releasesPath,
  onDeleted,
}: ReleaseWorkspaceHeaderProps) {
  const { t } = useTranslation('releases')
  const releaseLabel = release.name ?? `${release.baseRef} → ${release.compareRef}`
  const isDraft = release.status === ReleaseStatusValue.DRAFT
  const canSync = isDraft || release.status === ReleaseStatusValue.READY_TO_RELEASE
  const coveragePercent =
    stats.coverage.total === 0 ? 100 : Math.round((stats.coverage.assigned / stats.coverage.total) * 100)
  const openFlags = stats.flagDecisionsTotal - stats.flagDecisionsDecided

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-b border-white/8 pb-6">
      <div className="flex min-w-0 flex-col gap-3">
        <Link
          to={releasesPath}
          className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-button)] text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {t('view.back')}
        </Link>
        <h1 className="break-words font-display text-display-md font-bold tracking-tight text-foreground">
          {releaseLabel}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <ReleaseStatusControl
            releaseId={release.id}
            currentStatus={release.status}
            allowedNextStatuses={release.allowedNextStatuses}
          />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="size-3.5 shrink-0" aria-hidden />
            <span className="font-mono text-xs text-foreground/70">{release.baseRef}</span>
            <span aria-hidden>→</span>
            <span className="font-mono text-xs text-foreground/70">{release.compareRef}</span>
          </span>
          {release.prUrl && (
            <a
              href={release.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('view.prUrlAriaLabel')}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('view.prUrl')}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          )}
          {release.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <HeaderMetric
            label={t('workspace.metrics.coverage')}
            value={`${coveragePercent}%`}
            highlight={stats.coverage.ready ? 'good' : undefined}
          />
          <HeaderMetric label={t('workspace.metrics.prs')} value={String(stats.prCount)} />
          <HeaderMetric
            label={t('workspace.metrics.live')}
            value={`${stats.liveProductCount}/${stats.productCount}`}
          />
          <HeaderMetric
            label={t('workspace.metrics.openFlags')}
            value={String(openFlags)}
            highlight={openFlags > 0 ? 'attention' : 'good'}
          />
        </dl>
        <div className="flex items-center gap-2">
          {canSync && <SyncNewPrsButton releaseId={release.id} />}
          <DeleteReleaseButton
            releaseId={release.id}
            projectId={projectId}
            releaseLabel={releaseLabel}
            status={release.status}
            onDeleted={onDeleted}
            variant="icon"
          />
          {isDraft && <ConfirmReleaseButton releaseId={release.id} coverageReady={stats.coverage.ready} />}
        </div>
      </div>
    </header>
  )
}
