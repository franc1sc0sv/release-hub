import { useTranslation } from 'react-i18next'
import { ExternalLink, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CoverageMeter } from './CoverageMeter'
import { ReleaseFeatureNode } from './ReleaseFeatureNode'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Rocket } from 'lucide-react'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FEATURE_STATE_BADGE_CLASS } from '@/features/features/constants/feature-enums'
import type { GetReleaseTreeQuery, ReleaseStatus } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

const STATUS_CLASS: Record<ReleaseStatus, string> = {
  DRAFT: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  PR_CREATED: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  MERGED: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  DEPLOYED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
}

interface OverviewTabProps {
  release: ReleaseNode
  features: FeatureNodes
}

export function OverviewTab({ release, features }: OverviewTabProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {release.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label={t('view.tagsLabel')}>
            {release.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs font-medium text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Badge
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[release.status]}`}
        >
          {enumLabels.releaseStatus(release.status)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3.5 shrink-0" aria-hidden />
          <span className="font-mono text-foreground/70">{release.baseRef}</span>
          <span aria-hidden>→</span>
          <span className="font-mono text-foreground/70">{release.compareRef}</span>
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
      </div>

      <CoverageMeter releaseId={release.id} />

      <section aria-label={t('view.features')}>
        {features.length === 0 ? (
          <GlassCard>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
                <Rocket className="size-7 text-indigo-400" aria-hidden />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-foreground">
                  {t('view.empty.heading')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('view.empty.description')}
                </p>
              </div>
            </CardContent>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {features.map((node) => {
              const currentState = node.feature.currentState
              return (
                <div key={node.feature.id} className="space-y-0">
                  <ReleaseFeatureNode
                    node={node}
                    badge={
                      node.feature.suggested ? (
                        <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
                          {t('view.feature.suggested')}
                        </Badge>
                      ) : currentState ? (
                        <Badge
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${FEATURE_STATE_BADGE_CLASS[currentState]}`}
                        >
                          {enumLabels.featureState(currentState)}
                        </Badge>
                      ) : null
                    }
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
