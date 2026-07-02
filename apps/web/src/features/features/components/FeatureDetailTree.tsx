import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { format } from 'date-fns'
import { ChevronDown, GitBranch, GitMerge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { EmptyState } from '@/components/nebula/EmptyState'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { TicketChip } from '@/features/releases/components/TicketChip'
import { featureStateTone } from '../constants/feature-enums'
import { ReleaseStatusValue } from '@/features/releases/constants/release-enums'
import { ROUTES } from '@/lib/routes'
import type { GetFeatureQuery, FeatureState } from '@/generated/graphql'

type FeatureRelease = GetFeatureQuery['getFeature']['releases'][number]
type FeaturePr = GetFeatureQuery['getFeature']['prs'][number]
type FeatureCommit = FeaturePr['commits'][number]
type FeatureSnapshot = GetFeatureQuery['getFeature']['snapshots'][number]

interface DetailCommitRowProps {
  commit: FeatureCommit
}

function DetailCommitRow({ commit }: DetailCommitRowProps) {
  const shortSha = commit.sha.slice(0, 7)
  const formattedDate = format(new Date(commit.date), 'MMM d, yyyy')

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-white/5 bg-white/3 px-4 py-3">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-indigo-400/60" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-foreground/90">{commit.message}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{shortSha}</span>
          <span className="text-foreground/70">{commit.author}</span>
          <time className="font-mono" dateTime={commit.date}>
            {formattedDate}
          </time>
        </div>
      </div>
    </div>
  )
}

interface DetailPrRowProps {
  pr: FeaturePr
}

function DetailPrRow({ pr }: DetailPrRowProps) {
  const { t } = useTranslation('releases')
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  const formattedDate = format(new Date(pr.mergedAt), 'MMM d, yyyy')

  const commitCount = pr.commits.length
  const commitLabel = t('builder.pr.commitsCount', { count: commitCount })
  const toggleLabel = open
    ? t('builder.pr.collapseCommits')
    : t('builder.pr.expandCommits')

  const prLink = pr.releaseId
    ? `${ROUTES.RELEASE_DETAIL.replace(':releaseId', pr.releaseId)}?section=prs`
    : null

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
          <GitMerge className="size-4 text-indigo-400" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
            {prLink ? (
              <Link
                to={prLink}
                className="truncate font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[var(--radius-button)]"
              >
                {pr.title}
              </Link>
            ) : (
              <p className="truncate font-medium text-foreground">{pr.title}</p>
            )}
            {pr.tickets[0] && <TicketChip ticket={pr.tickets[0]} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {t('builder.pr.by')}{' '}
              <span className="text-foreground/70">{pr.author}</span>
            </span>
            <span>
              {t('builder.pr.mergedAt')}{' '}
              <time className="font-mono" dateTime={pr.mergedAt}>
                {formattedDate}
              </time>
            </span>
            <span>{commitLabel}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={toggleLabel}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="shrink-0"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" aria-hidden />
          </motion.span>
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="commits"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 border-t border-white/8 px-5 pb-4 pt-3">
              {pr.commits.map((commit) => (
                <DetailCommitRow key={commit.sha} commit={commit} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FlagStatePillsProps {
  flagState: NonNullable<FeatureSnapshot['flagState']>
}

function FlagStatePills({ flagState }: FlagStatePillsProps) {
  const { t } = useTranslation('releases')

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge tone={flagState.staging ? StatusBadgeTone.EMERALD : StatusBadgeTone.SLATE}>
        {t('view.feature.flagState.staging')}:{' '}
        {flagState.staging ? t('view.feature.flagState.on') : t('view.feature.flagState.off')}
      </StatusBadge>
      <StatusBadge tone={flagState.production ? StatusBadgeTone.EMERALD : StatusBadgeTone.SLATE}>
        {t('view.feature.flagState.production')}:{' '}
        {flagState.production ? t('view.feature.flagState.on') : t('view.feature.flagState.off')}
      </StatusBadge>
    </div>
  )
}

interface ReleaseGroupProps {
  release: FeatureRelease
  prs: FeaturePr[]
  snapshotState: FeatureState | null
  snapshotFlagState: FeatureSnapshot['flagState'] | null
}

function ReleaseGroup({ release, prs, snapshotState, snapshotFlagState }: ReleaseGroupProps) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()

  const formattedDate = format(new Date(release.createdAt), 'MMM d, yyyy')

  const prCountLabel = t('tree.prCount', { count: prs.length })
  const toggleLabel = open ? t('tree.prCount', { count: prs.length }) : prCountLabel

  return (
    <div className="rounded-[var(--radius-card)] border border-white/12 bg-white/4 backdrop-blur-sm">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30">
          <GitBranch className="size-4 text-indigo-400" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to={ROUTES.RELEASE_DETAIL.replace(':releaseId', release.id)}
              className="font-display font-semibold text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[var(--radius-button)]"
            >
              {t('tree.releaseHeading', { name: release.name })}
            </Link>
            <span className="text-xs text-muted-foreground">{prCountLabel}</span>
            {snapshotState && (
              <StatusBadge tone={featureStateTone(snapshotState)}>
                {enumLabels.featureState(snapshotState)}
              </StatusBadge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{release.baseRef}</span>
            <span>→</span>
            <span className="font-mono">{release.compareRef}</span>
            <span>·</span>
            <time className="font-mono" dateTime={release.createdAt}>
              {formattedDate}
            </time>
          </div>
          {snapshotFlagState && <FlagStatePills flagState={snapshotFlagState} />}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={toggleLabel}
          onClick={() => setOpen((prev) => !prev)}
          className="mt-1 flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" aria-hidden />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && prs.length > 0 && (
          <motion.div
            key="prs"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 border-t border-white/8 px-4 pb-4 pt-3">
              {prs.map((pr) => (
                <DetailPrRow key={pr.id} pr={pr} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FeatureDetailTreeProps {
  releases: FeatureRelease[]
  prs: FeaturePr[]
  snapshots: FeatureSnapshot[]
}

export function FeatureDetailTree({ releases, prs, snapshots }: FeatureDetailTreeProps) {
  const { t } = useTranslation('features')

  const deployedReleases = releases.filter((r) => r.status === ReleaseStatusValue.DEPLOYED)

  const snapshotByReleaseId = new Map<string, FeatureSnapshot>(
    snapshots.map((snapshot) => [snapshot.releaseId, snapshot]),
  )

  if (deployedReleases.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch className="size-7 text-muted-foreground" aria-hidden />}
        heading={t('detail.noReleasesHeading')}
        description={t('detail.noReleases')}
      />
    )
  }

  return (
    <div className="space-y-3">
      {deployedReleases.map((release) => {
        const releasePrs = prs.filter((pr) => pr.releaseId === release.id)
        const snapshot = snapshotByReleaseId.get(release.id) ?? null
        return (
          <ReleaseGroup
            key={release.id}
            release={release}
            prs={releasePrs}
            snapshotState={snapshot?.state ?? null}
            snapshotFlagState={snapshot?.flagState ?? null}
          />
        )
      })}
    </div>
  )
}
