import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ArrowUpRight, GitMerge } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FlagChangeActionValue } from '@/features/releases/constants/release-enums'
import type { GetFlagDetailQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>
type FlagPullRequestChange = TrackedFlagDetail['pullRequestChanges'][number]

const CHANGE_TONE: Record<FlagPullRequestChange['action'], 'emerald' | 'amber' | 'rose' | 'slate'> = {
  [FlagChangeActionValue.added]: 'emerald',
  [FlagChangeActionValue.modified]: 'amber',
  [FlagChangeActionValue.removed]: 'rose',
  [FlagChangeActionValue.unchanged]: 'slate',
}

interface FlagPullRequestRowProps {
  pr: FlagPullRequestChange
  repo: string | null
}

function FlagPullRequestRow({ pr, repo }: FlagPullRequestRowProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()
  const prUrl = repo ? `https://github.com/${repo}/pull/${pr.prNumber}` : null

  return (
    <li className="flex items-start gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
        <GitMerge className="size-4 text-indigo-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        {prUrl ? (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('detail.pullRequests.openGitHub', { number: pr.prNumber, title: pr.prTitle })}
            className="group/pr-link inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-mono text-muted-foreground">#{pr.prNumber}</span>
            <span className="truncate">{pr.prTitle}</span>
            <ArrowUpRight
              className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover/pr-link:translate-x-0.5 group-hover/pr-link:-translate-y-0.5"
              aria-hidden
            />
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground">
            <span className="font-mono text-muted-foreground">#{pr.prNumber}</span> {pr.prTitle}
          </p>
        )}
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {pr.prAuthor} · {format(new Date(pr.prMergedAt), 'MMM d, yyyy')}
          {pr.detectedFile ? ` · ${pr.detectedFile}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge tone={CHANGE_TONE[pr.action]}>{enumLabels.flagAction(pr.action)}</StatusBadge>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {enumLabels.flagReferenceKind(pr.kind)}
        </span>
      </div>
    </li>
  )
}

interface FlagPullRequestChangesCardProps {
  changes: FlagPullRequestChange[]
  repo: string | null
}

export function FlagPullRequestChangesCard({ changes, repo }: FlagPullRequestChangesCardProps) {
  const { t } = useTranslation('flags')

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.pullRequests.title')}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {changes.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('detail.pullRequests.empty')}
          </p>
        ) : (
          <ul className="space-y-0">
            {changes.map((pr) => (
              <FlagPullRequestRow key={`${pr.prNumber}-${pr.kind}`} pr={pr} repo={repo} />
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
