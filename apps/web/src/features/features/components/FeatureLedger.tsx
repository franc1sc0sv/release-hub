import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { m, useReducedMotion } from 'motion/react'
import { AlertCircle, Layers, Loader2 } from 'lucide-react'
import { Link, generatePath, useParams } from 'react-router-dom'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { TagChip } from '@/components/nebula/TagChip'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { CreateFeatureDialog } from './CreateFeatureDialog'
import { TagChips } from './TagChips'
import { FeatureStateControl } from './FeatureStateControl'
import { DeleteFeatureButton } from './DeleteFeatureButton'
import { useFeaturesPage } from '../hooks/useFeaturesPage'
import type { FeaturePageItem } from '../hooks/useFeaturesPage'

function FeatureRowSkeleton() {
  return <Skeleton className="h-[76px] w-full rounded-[var(--radius-card)]" />
}

function FeatureRow({ feature }: { feature: FeaturePageItem }) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const detailPath = generatePath(ROUTES.PROJECT_FEATURE_DETAIL, {
    organizationId: organizationId ?? '',
    projectId: projectId ?? '',
    id: feature.id,
  })

  return (
    <m.li variants={reduceMotion ? undefined : slideUp}>
      <div className="group flex flex-wrap items-start gap-x-4 gap-y-3 rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-5 py-4 transition-colors duration-200 hover:border-white/20 hover:bg-white/8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Link
            to={detailPath}
            className="rounded-[var(--radius-button)] font-medium text-foreground transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {feature.name}
          </Link>
          <TagChip>{enumLabels.featureKind(feature.kind)}</TagChip>
          <FeatureStateControl featureId={feature.id} currentState={feature.currentState} />
          {feature.suggested && <StatusBadge tone="violet">{t('suggested')}</StatusBadge>}
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          <TagChips featureId={feature.id} tags={feature.tags} />
          <DeleteFeatureButton featureId={feature.id} featureName={feature.name} />
        </div>
      </div>
    </m.li>
  )
}

export function FeatureLedger() {
  const { t } = useTranslation('features')
  const reduceMotion = useReducedMotion()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { features, totalCount, loadingInitial, loadingMore, error, sentinelRef } =
    useFeaturesPage({ search })

  const visibleFeatures = features.filter((feature) => !feature.suggested)

  const createAction = (
    <Can I={Action.CREATE} a={Subject.FEATURE}>
      <GradientButton onClick={() => setDialogOpen(true)}>{t('new')}</GradientButton>
    </Can>
  )

  return (
    <section aria-label={t('title')} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          value={search}
          onValueChange={setSearch}
          placeholder={t('searchPlaceholder')}
          className="max-w-xs"
        />
        {!loadingInitial && !error && visibleFeatures.length > 0 && createAction}
      </div>

      {!loadingInitial && !error && visibleFeatures.length > 0 && (
        <p className="text-sm text-muted-foreground">{t('count', { count: totalCount })}</p>
      )}

      {loadingInitial && (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <FeatureRowSkeleton key={index} />
          ))}
        </div>
      )}

      {error && !loadingInitial && (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {t('error.heading')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('error.description')}</p>
            </div>
          </CardContent>
        </GlassCard>
      )}

      {!loadingInitial && !error && visibleFeatures.length === 0 && (
        <>
          <EmptyState
            icon={<Layers className="size-7 text-brand-indigo-bright" aria-hidden />}
            heading={search ? t('emptySearch.heading') : t('empty.heading')}
            description={search ? t('emptySearch.description') : t('empty.description')}
            action={
              !search && (
                <Can I={Action.CREATE} a={Subject.FEATURE}>
                  <GradientButton onClick={() => setDialogOpen(true)}>
                    {t('empty.cta')}
                  </GradientButton>
                </Can>
              )
            }
          />
          <CreateFeatureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
      )}

      {!loadingInitial && !error && visibleFeatures.length > 0 && (
        <>
          <m.ul
            variants={reduceMotion ? undefined : staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
            role="list"
          >
            {visibleFeatures.map((feature) => (
              <FeatureRow key={feature.id} feature={feature} />
            ))}
          </m.ul>

          <div ref={sentinelRef} aria-hidden className="h-1" />
          {loadingMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="size-5 animate-spin text-indigo-400" aria-hidden />
            </div>
          )}

          <CreateFeatureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
      )}
    </section>
  )
}
