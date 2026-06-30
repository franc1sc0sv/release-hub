import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronDown, ExternalLink, GitMerge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommitRow } from './CommitRow'
import { TicketChip } from './TicketChip'
import { PrSummaryPanel } from './PrSummaryPanel'
import type { CommitType, TicketLinkType } from '@/generated/graphql'

export interface PullRequestItem {
  id: string
  number: number
  title: string
  url?: string | null
  author: string
  mergedAt: string
  body: string | null
  summary?: string | null
  summaryEditedAt?: string | null
  tickets: Array<Pick<TicketLinkType, 'issueId' | 'source' | 'url' | 'title' | 'confidence'> & { description?: string | null }>
  commits: Array<Pick<CommitType, 'sha' | 'message' | 'author' | 'date'>>
}

interface PullRequestRowProps {
  pr: PullRequestItem
}

export function PullRequestRow({ pr }: PullRequestRowProps) {
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
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:border-white/15">
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
          <GitMerge className="size-4 text-indigo-400" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {pr.url ? (
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('builder.pr.openGitHub', { number: pr.number, title: pr.title })}
                className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
                <span className="truncate font-medium">{pr.title}</span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : (
              <>
                <span className="font-mono text-sm text-muted-foreground">#{pr.number}</span>
                <p className="truncate font-medium text-foreground">{pr.title}</p>
              </>
            )}
            {pr.tickets.map((ticket) => (
              <TicketChip key={ticket.issueId} ticket={ticket} />
            ))}
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
            key="expanded"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-3 border-t border-white/8 px-5 pb-4 pt-3">
              <PrSummaryPanel pr={pr} />
              {pr.commits.map((commit) => (
                <CommitRow key={commit.sha} commit={commit} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
