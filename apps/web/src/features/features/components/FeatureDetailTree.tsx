import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronDown, GitBranch, GitMerge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicketChip } from '@/features/releases/components/TicketChip'
import type { GetFeatureQuery } from '@/generated/graphql'

type FeatureRelease = GetFeatureQuery['getFeature']['releases'][number]
type FeaturePr = GetFeatureQuery['getFeature']['prs'][number]
type FeatureCommit = FeaturePr['commits'][number]

interface DetailCommitRowProps {
  commit: FeatureCommit
}

function DetailCommitRow({ commit }: DetailCommitRowProps) {
  const shortSha = commit.sha.slice(0, 7)
  const formattedDate = new Date(commit.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-white/5 bg-white/3 px-4 py-3">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-indigo-400/60" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-foreground/90">{commit.message}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{shortSha}</span>
          <span className="text-foreground/70">{commit.author}</span>
          <time dateTime={commit.date}>{formattedDate}</time>
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

  const formattedDate = new Date(pr.mergedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const commitCount = pr.commits.length
  const commitLabel = t('builder.pr.commitsCount', { count: commitCount })
  const toggleLabel = open
    ? t('builder.pr.collapseCommits')
    : t('builder.pr.expandCommits')

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
          <GitMerge className="size-4 text-indigo-400" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
            <p className="truncate font-medium text-foreground">{pr.title}</p>
            {pr.tickets[0] && <TicketChip ticket={pr.tickets[0]} />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {t('builder.pr.by')}{' '}
              <span className="text-foreground/70">{pr.author}</span>
            </span>
            <span>
              {t('builder.pr.mergedAt')}{' '}
              <time dateTime={pr.mergedAt}>{formattedDate}</time>
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
            <ChevronDown className="size-4" />
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

interface ReleaseGroupProps {
  release: FeatureRelease
  prs: FeaturePr[]
}

function ReleaseGroup({ release, prs }: ReleaseGroupProps) {
  const { t } = useTranslation('features')
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()

  const formattedDate = new Date(release.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const prCountLabel = t('tree.prCount', { count: prs.length })
  const toggleLabel = open ? t('tree.prCount', { count: prs.length }) : prCountLabel

  return (
    <div className="rounded-[var(--radius-card)] border border-white/12 bg-white/4 backdrop-blur-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-label={toggleLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-[var(--radius-card)]"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30">
          <GitBranch className="size-4 text-indigo-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display font-semibold text-foreground">
              {t('tree.releaseHeading', { name: release.name })}
            </span>
            <span className="text-xs text-muted-foreground">{prCountLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{release.baseRef}</span>
            <span>→</span>
            <span className="font-mono">{release.compareRef}</span>
            <span>·</span>
            <time dateTime={release.createdAt}>{formattedDate}</time>
          </div>
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="flex shrink-0 items-center justify-center text-muted-foreground"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

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
}

export function FeatureDetailTree({ releases, prs }: FeatureDetailTreeProps) {
  const { t } = useTranslation('features')

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-white/10 bg-white/4 px-6 py-12 text-center">
        <GitBranch className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t('detail.noReleases')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {releases.map((release) => {
        const releasePrs = prs.filter((pr) => pr.releaseId === release.id)
        return (
          <ReleaseGroup key={release.id} release={release} prs={releasePrs} />
        )
      })}
    </div>
  )
}
