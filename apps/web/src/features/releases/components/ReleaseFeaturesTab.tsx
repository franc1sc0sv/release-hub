import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Rocket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { ReleaseFeatureNode } from './ReleaseFeatureNode'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FEATURE_STATE_BADGE_CLASS } from '@/features/features/constants/feature-enums'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

interface ReleaseFeaturesTabProps {
  features: FeatureNodes
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function ReleaseFeaturesTab({ features }: ReleaseFeaturesTabProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 250)

  const acceptedFeatures = features.filter((node) => !node.feature.suggested)
  const filteredFeatures = acceptedFeatures.filter((node) =>
    node.feature.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('view.features.searchPlaceholder')}
          aria-label={t('view.features.searchPlaceholder')}
          className="rounded-full pl-9"
        />
      </div>

      {filteredFeatures.length === 0 ? (
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
          {filteredFeatures.map((node) => {
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
    </div>
  )
}
