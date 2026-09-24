import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { GitMerge, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/nebula/GlassCard'
import { SearchField } from '@/components/nebula/SearchField'
import { CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { ReleaseSectionHeading } from './ReleaseSectionHeading'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']
type PrNode = FeatureNodes[number]['prs'][number]

interface ReleasePrsSectionProps {
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
      if (!seen.has(pr.id)) seen.set(pr.id, { pr, featureName: node.feature.name })
    }
  }
  return [...seen.values()].sort((a, b) => b.pr.number - a.pr.number)
}

export function ReleasePrsSection({ features }: ReleasePrsSectionProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const [search, setSearch] = useState('')

  const flattenedPrs = flattenPrs(features)
  const normalizedSearch = search.trim().toLowerCase()
  const filteredPrs = flattenedPrs.filter(({ pr, featureName }) => {
    if (!normalizedSearch) return true
    return (
      pr.title.toLowerCase().includes(normalizedSearch) ||
      `#${pr.number}`.includes(normalizedSearch) ||
      featureName.toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <section aria-labelledby="release-prs-heading" className="space-y-5">
      <ReleaseSectionHeading
        id="release-prs-heading"
        title={t('workspace.sections.prs')}
        description={t('workspace.prs.description', { count: flattenedPrs.length })}
        actions={
          <SearchField
            value={search}
            onValueChange={setSearch}
            placeholder={t('view.prs.searchPlaceholder')}
            className="w-full sm:w-64"
          />
        }
      />

      {filteredPrs.length === 0 ? (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
              <GitMerge className="size-7 text-indigo-400" aria-hidden />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">{t('view.prs.empty.heading')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('view.prs.empty.description')}</p>
            </div>
          </CardContent>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20">{t('workspace.prs.columns.number')}</TableHead>
                <TableHead>{t('workspace.prs.columns.title')}</TableHead>
                <TableHead>{t('workspace.prs.columns.feature')}</TableHead>
                <TableHead className="w-24 text-right">{t('workspace.prs.columns.commits')}</TableHead>
                <TableHead>{t('workspace.prs.columns.flags')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrs.map(({ pr, featureName }) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{pr.number}</TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    {pr.url ? (
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('builder.pr.openGitHub', { number: pr.number, title: pr.title })}
                        className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {pr.title}
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">{pr.title}</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('builder.pr.by')} <span className="text-foreground/70">{pr.author}</span>
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-foreground/80">
                      {featureName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{pr.commits.length}</TableCell>
                  <TableCell className="whitespace-normal">
                    {pr.flagChanges.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
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
                            <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase tracking-wide">
                              {enumLabels.flagAction(change.action)}
                            </Badge>
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </GlassCard>
      )}
    </section>
  )
}
