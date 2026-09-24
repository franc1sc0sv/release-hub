import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Rocket } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { SearchField } from '@/components/nebula/SearchField'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { CardContent } from '@/components/ui/card'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { cn } from '@/lib/utils'
import { FEATURE_STATE_BAR_CLASS, featureStateTone } from '@/features/features/constants/feature-enums'
import { ReleaseFeatureNode } from './ReleaseFeatureNode'
import { ReleaseSectionHeading } from './ReleaseSectionHeading'
import type { IFeatureStateCount } from '../hooks/useReleaseWorkspaceStats'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

interface ReleaseFeaturesSectionProps {
  features: FeatureNodes
  releaseId: string
  stateBreakdown: IFeatureStateCount[]
}

export function ReleaseFeaturesSection({ features, releaseId, stateBreakdown }: ReleaseFeaturesSectionProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [search, setSearch] = useState('')

  const acceptedFeatures = features.filter((node) => !node.feature.suggested)
  const filteredFeatures = acceptedFeatures.filter((node) =>
    node.feature.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <section aria-labelledby="release-features-heading" className="space-y-5">
      <ReleaseSectionHeading
        id="release-features-heading"
        title={t('workspace.sections.features')}
        description={t('workspace.features.description')}
        actions={
          <SearchField
            value={search}
            onValueChange={setSearch}
            placeholder={t('view.features.searchPlaceholder')}
            className="w-full sm:w-64"
          />
        }
      />

      {stateBreakdown.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5" aria-hidden>
            {stateBreakdown.map(({ state, count }) => (
              <span
                key={state}
                className={cn('h-full', FEATURE_STATE_BAR_CLASS[state])}
                style={{ width: `${(count / acceptedFeatures.length) * 100}%` }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label={t('overview.featureBreakdown.title')}>
            {stateBreakdown.map(({ state, count }) => (
              <li key={state} className="flex items-center gap-2">
                <StatusBadge tone={featureStateTone(state)}>{enumLabels.featureState(state)}</StatusBadge>
                <span className="font-mono text-sm tabular-nums text-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filteredFeatures.length === 0 ? (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
              <Rocket className="size-7 text-indigo-400" aria-hidden />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">{t('view.empty.heading')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('view.empty.description')}</p>
            </div>
          </CardContent>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredFeatures.map((node) => (
            <ReleaseFeatureNode key={node.feature.id} node={node} releaseId={releaseId} />
          ))}
        </div>
      )}
    </section>
  )
}
