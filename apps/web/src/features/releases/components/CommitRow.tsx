import { useTranslation } from 'react-i18next'
import type { CommitType } from '@/generated/graphql'

export type CommitItem = Pick<CommitType, 'sha' | 'message' | 'author' | 'date'>

interface CommitRowProps {
  commit: CommitItem
}

export function CommitRow({ commit }: CommitRowProps) {
  const { t } = useTranslation('releases')

  const shortSha = commit.sha.slice(0, 7)
  const formattedDate = new Date(commit.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-indigo-400/60" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-foreground/90">{commit.message}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{shortSha}</span>
          <span>
            {t('builder.pr.by')} <span className="text-foreground/70">{commit.author}</span>
          </span>
          <time dateTime={commit.date}>{formattedDate}</time>
        </div>
      </div>
    </div>
  )
}
