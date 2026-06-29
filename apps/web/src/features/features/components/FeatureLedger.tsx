import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { AlertCircle, BookOpen, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { CreateFeatureDialog } from './CreateFeatureDialog'
import { TagChips } from './TagChips'
import { useFeatures } from '../hooks/useFeatures'
import { useState } from 'react'
import type { FeatureItem } from '../hooks/useFeatures'
import type { FeatureKind, FeatureState } from '@/generated/graphql'

const kindVariant: Record<FeatureKind, 'outline' | 'secondary'> = {
  PRODUCT: 'outline',
  DEFAULT: 'secondary',
}

const stateColorMap: Record<FeatureState, string> = {
  IN_PROGRESS: 'border-indigo-400/40 text-indigo-300',
  SHIPPED_FLAG_OFF: 'border-slate-400/40 text-slate-300',
  LIVE_STAGING: 'border-amber-400/40 text-amber-300',
  LIVE_PROD: 'border-emerald-400/40 text-emerald-300',
  PARTIAL: 'border-violet-400/40 text-violet-300',
  FULLY_RELEASED: 'border-emerald-300/40 text-emerald-200',
  FLAG_CLEANUP_PENDING: 'border-orange-400/40 text-orange-300',
  BLOCKED: 'border-rose-400/40 text-rose-300',
}

function FeatureRow({ feature }: { feature: FeatureItem }) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const detailPath = ROUTES.FEATURES_DETAIL.replace(':id', feature.id)

  return (
    <motion.li variants={reduceMotion ? undefined : slideUp}>
      <Link
        to={detailPath}
        className="group block rounded-[var(--radius-card)] border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-start gap-4 px-5 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground group-hover:text-white transition-colors">
                {feature.name}
              </span>
              <Badge
                variant={kindVariant[feature.kind as FeatureKind]}
                className="rounded-full text-xs"
              >
                {enumLabels.featureKind(feature.kind as FeatureKind)}
              </Badge>
              <Badge
                variant="outline"
                className={`rounded-full text-xs ${feature.currentState ? stateColorMap[feature.currentState] : 'border-white/20 text-muted-foreground'}`}
              >
                {feature.currentState ? enumLabels.featureState(feature.currentState) : t('state.none')}
              </Badge>
              {feature.suggested && (
                <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-xs text-fuchsia-300">
                  {t('suggested')}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <TagChips
                featureId={feature.id}
                projectId={feature.projectId}
                tags={feature.tags}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.li>
  )
}

export function FeatureLedger() {
  const { t } = useTranslation('features')
  const reduceMotion = useReducedMotion()
  const { features, loading, error } = useFeatures()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="size-8 animate-spin text-indigo-400" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </GlassCard>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (features.length === 0) {
    return (
      <>
        <EmptyState
          icon={<BookOpen className="size-7 text-brand-indigo-bright" aria-hidden />}
          heading={t('empty.heading')}
          description={t('empty.description')}
          action={
            <Can I={Action.CREATE} a={Subject.FEATURE}>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="rounded-[var(--radius-button)] bg-primary px-5 py-2 text-sm font-medium text-white shadow-glow-indigo transition-shadow duration-300 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('empty.cta')}
              </button>
            </Can>
          }
        />
        <CreateFeatureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    )
  }

  return (
    <section aria-label={t('title')}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('count', { count: features.length })}
        </p>
        <Can I={Action.CREATE} a={Subject.FEATURE}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-[var(--radius-button)] bg-primary px-4 py-2 text-sm font-medium text-white shadow-glow-indigo transition-shadow duration-300 hover:shadow-glow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('new')}
          </button>
        </Can>
      </div>

      <motion.ul
        variants={reduceMotion ? undefined : staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2"
        role="list"
      >
        {features.map((feature) => (
          <FeatureRow key={feature.id} feature={feature} />
        ))}
      </motion.ul>

      <CreateFeatureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  )
}
