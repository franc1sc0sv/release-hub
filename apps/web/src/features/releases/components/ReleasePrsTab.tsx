import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { GitMerge, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/nebula/GlassCard'
import { SearchField } from '@/components/nebula/SearchField'
import { CardContent } from '@/components/ui/card'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type PrNode = FeatureNodes[number]['prs'][number]

interface ReleasePrsTabProps {
  features: FeatureNodes
}

interface FlattenedPr {
  pr: PrNode
  featureName: string
}

function flattenPrs(features: FeatureNodes): FlattenedPr[] {
  const seen = new Map<string, FlattenedPr>()

  for (const node of features) {
    for (const pr of node.prs) {
      if (!seen.has(pr.id)) {
        seen.set(pr.id, { pr, featureName: node.feature.name })
      }
    }
  }

  return Array.from(seen.values())
}

export function ReleasePrsTab({ features }: ReleasePrsTabProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const [search, setSearch] = useState('')

  const flattenedPrs = flattenPrs(features)
  const normalizedSearch = search.trim().toLowerCase()
  const filteredPrs = flattenedPrs.filter(({ pr }) => {
    if (!normalizedSearch) return true
    return (
      pr.title.toLowerCase().includes(normalizedSearch) ||
      `#${pr.number}`.includes(normalizedSearch)
    )
  })

  return (
    <div className="space-y-4">
      <SearchField
        value={search}
        onValueChange={setSearch}
        placeholder={t('view.prs.searchPlaceholder')}
        className="w-full max-w-xs"
      />

      {filteredPrs.length === 0 ? (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
              <GitMerge className="size-7 text-indigo-400" aria-hidden />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {t('view.prs.empty.heading')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('view.prs.empty.description')}
              </p>
            </div>
          </CardContent>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredPrs.map(({ pr, featureName }) => (
            <div
              key={pr.id}
              className="rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:border-white/15"
            >
              <div className="flex items-start gap-4 px-5 py-4">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                  <GitMerge className="size-4 text-indigo-400" />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {pr.url ? (
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('builder.pr.openGitHub', {
                          number: pr.number,
                          title: pr.title,
                        })}
                        className="flex items-center gap-1 text-foreground underline-offset-2 hover:underline hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-mono text-sm text-muted-foreground">
                          #{pr.number}
                        </span>
                        <span className="truncate font-medium">{pr.title}</span>
                        <ExternalLink
                          className="size-3 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </a>
                    ) : (
                      <>
                        <span className="font-mono text-sm text-muted-foreground">
                          #{pr.number}
                        </span>
                        <p className="truncate font-medium text-foreground">{pr.title}</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      {t('builder.pr.by')}{' '}
                      <span className="text-foreground/70">{pr.author}</span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                      {featureName}
                    </span>
                  </div>

                  {pr.flagChanges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pr.flagChanges.map((change, index) => (
                        <span
                          key={`${change.flagKey}-${index}`}
                          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2 py-0.5"
                        >
                          <Link
                            to={generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
                              organizationId: organizationId ?? '',
                              projectId: projectId ?? '',
                              flagKey: change.flagKey,
                            })}
                            className="font-mono text-xs text-foreground/70 underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {change.flagKey}
                          </Link>
                          <Badge
                            variant="outline"
                            className="rounded-full font-mono text-[10px] uppercase tracking-wide"
                          >
                            {enumLabels.flagAction(change.action)}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
