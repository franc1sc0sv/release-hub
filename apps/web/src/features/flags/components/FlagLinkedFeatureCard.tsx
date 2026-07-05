import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { ChevronRight, Layers } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import type { GetFlagDetailQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<NonNullable<GetFlagDetailQuery['flagDetail']>['tracked']>

interface FlagLinkedFeatureCardProps {
  feature: TrackedFlagDetail['feature']
}

export function FlagLinkedFeatureCard({ feature }: FlagLinkedFeatureCardProps) {
  const { t } = useTranslation('flags')
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.linkedFeature.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feature ? (
          <Link
            to={generatePath(ROUTES.PROJECT_FEATURE_DETAIL, {
              organizationId: organizationId ?? '',
              projectId: projectId ?? '',
              id: feature.id,
            })}
            className="flex items-center gap-3 rounded-[var(--radius-button)] py-1 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
              <Layers className="size-4 text-indigo-400" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {feature.name}
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">{t('detail.linkedFeature.empty')}</p>
        )}
      </CardContent>
    </GlassCard>
  )
}
