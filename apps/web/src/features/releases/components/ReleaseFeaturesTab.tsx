import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Rocket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/nebula/GlassCard'
import { SearchField } from '@/components/nebula/SearchField'
import { CardContent } from '@/components/ui/card'
import { ReleaseFeatureNode } from './ReleaseFeatureNode'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

interface ReleaseFeaturesTabProps {
  features: FeatureNodes
}

export function ReleaseFeaturesTab({ features }: ReleaseFeaturesTabProps) {
  const { t } = useTranslation('releases')
  const [search, setSearch] = useState('')

  const acceptedFeatures = features.filter((node) => !node.feature.suggested)
  const filteredFeatures = acceptedFeatures.filter((node) =>
    node.feature.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <SearchField
        value={search}
        onValueChange={setSearch}
        placeholder={t('view.features.searchPlaceholder')}
        className="w-full max-w-xs"
      />

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
          {filteredFeatures.map((node) => (
            <div key={node.feature.id} className="space-y-0">
              <ReleaseFeatureNode
                node={node}
                badge={
                  node.feature.suggested ? (
                    <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
                      {t('view.feature.suggested')}
                    </Badge>
                  ) : null
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
