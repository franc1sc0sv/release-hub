import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { m, useReducedMotion } from 'motion/react'
import { Bot, ChevronDown, ExternalLink, GitMerge, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CommitRow } from './CommitRow'
import { TicketChip } from './TicketChip'
import { PrSummaryPanel } from './PrSummaryPanel'
import { FeatureCombobox } from './FeatureCombobox'
import { UPDATE_RELEASE } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type FeatureNode = FeatureNodes[number]
type PrNode = FeatureNode['prs'][number]

interface PrAssignmentRowProps {
  pr: PrNode
  featureName: string
  releaseId: string
  projectId: string
}

export function PrAssignmentRow({ pr, featureName, releaseId, projectId }: PrAssignmentRowProps) {
  const { t } = useTranslation('releases')
  const [showCommits, setShowCommits] = useState(false)
  const reduceMotion = useReducedMotion()

  const [updateRelease, { loading: saving }] = useMutation(UPDATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
  })

  const handleFeatureChange = useCallback(
    async (value: string) => {
      try {
        await updateRelease({
          variables: {
            input: {
              releaseId,
              prAssignments: [{ pullRequestId: pr.id, featureId: value }],
              tags: undefined,
            },
          },
        })
      } catch {
        toast.error(t('draft.assignError'))
      }
    },
    [updateRelease, releaseId, pr.id, t],
  )

  const confidenceLevel =
    pr.aiConfidence !== null && pr.aiConfidence !== undefined
      ? pr.aiConfidence >= 0.9
        ? 'high'
        : pr.aiConfidence >= 0.6
          ? 'medium'
          : 'low'
      : null

  const confidenceClass: Record<string, string> = {
    high: 'text-emerald-400',
    medium: 'text-amber-400',
    low: 'text-slate-400',
  }

  const formattedDate = new Date(pr.mergedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const toggleLabel = showCommits
    ? t('builder.pr.collapseCommits')
    : t('builder.pr.expandCommits')

  return (
    <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/5">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
          <GitMerge className="size-3.5 text-indigo-400" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {pr.url ? (
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('builder.pr.openGitHub', { number: pr.number, title: pr.title })}
                className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-xs text-muted-foreground">#{pr.number}</span>
                <span className="truncate text-sm font-medium">{pr.title}</span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            ) : (
              <>
                <span className="font-mono text-xs text-muted-foreground">#{pr.number}</span>
                <p className="truncate text-sm font-medium text-foreground">{pr.title}</p>
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
            <span>{t('builder.pr.commitsCount', { count: pr.commits.length })}</span>
          </div>

          {pr.aiRationale && confidenceLevel && (
            <div className="flex items-start gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-2">
              <Bot className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden />
              <div className="min-w-0 space-y-0.5">
                <span className={`text-xs font-medium ${confidenceClass[confidenceLevel]}`}>
                  {t(`draft.confidence.${confidenceLevel}`)}
                </span>
                <p className="text-xs text-muted-foreground">{pr.aiRationale}</p>
              </div>
            </div>
          )}

          <PrSummaryPanel pr={pr} />

          <div className="flex items-center gap-2">
            <label
              htmlFor={`feature-select-${pr.id}`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t('draft.assignTo')}
            </label>
            <FeatureCombobox
              id={`feature-select-${pr.id}`}
              projectId={projectId}
              value={pr.featureId ?? null}
              label={featureName}
              onChange={handleFeatureChange}
              disabled={saving}
            />
            {saving && (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label={toggleLabel}
          aria-expanded={showCommits}
          onClick={() => setShowCommits((p) => !p)}
          className="mt-1 flex shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <m.span
            animate={{ rotate: showCommits ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-4" aria-hidden />
          </m.span>
        </button>
      </div>

      {showCommits && pr.commits.length > 0 && (
        <div className="space-y-2 border-t border-white/8 px-4 pb-3 pt-2">
          {pr.commits.map((commit) => (
            <CommitRow key={commit.sha} commit={commit} />
          ))}
        </div>
      )}
    </div>
  )
}
