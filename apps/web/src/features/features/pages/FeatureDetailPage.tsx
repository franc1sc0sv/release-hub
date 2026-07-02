import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, AlertCircle, Loader2, GitBranch } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { TagChip } from '@/components/nebula/TagChip'
import { CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FeatureKindValue } from '../constants/feature-enums'
import { useFeature } from '../hooks/useFeature'
import { FeatureDetailTree } from '../components/FeatureDetailTree'
import { FeatureStateControl } from '../components/FeatureStateControl'
import type { FeatureKind } from '@/generated/graphql'

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const reduceMotion = useReducedMotion()
  const { detail, loading, error } = useFeature(id)

  if (loading) {
    return (
      <NebulaBackground className="p-6">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="size-8 animate-spin text-indigo-400" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  if (error) {
    return (
      <NebulaBackground className="p-6">
        <EmptyState
          icon={<AlertCircle className="size-7 text-destructive" aria-hidden />}
          heading={t('error.heading')}
          description={t('error.description')}
        />
      </NebulaBackground>
    )
  }

  if (!detail) {
    return (
      <NebulaBackground className="p-6">
        <EmptyState
          icon={<GitBranch className="size-7 text-muted-foreground" aria-hidden />}
          heading={t('detail.notFound')}
          description={t('detail.notFoundDescription')}
          action={
            <Link
              to={ROUTES.FEATURES}
              className="rounded-[var(--radius-button)] border border-white/20 bg-white/5 px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('back')}
            </Link>
          }
        />
      </NebulaBackground>
    )
  }

  const { feature, releases, prs, snapshots } = detail
  const featureKind = feature.kind as FeatureKind

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-8"
      >
        <motion.div variants={slideUp}>
          <Link
            to={ROUTES.FEATURES}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('back')}
          </Link>
        </motion.div>

        <motion.div variants={slideUp}>
          <GlassCard glow="indigo">
            <CardContent className="space-y-5 py-6">
              <div className="space-y-3">
                <p className="text-overline uppercase tracking-widest text-muted-foreground">
                  {t('subtitle')}
                </p>

                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
                    {feature.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <StatusBadge
                      tone={
                        featureKind === FeatureKindValue.PRODUCT
                          ? StatusBadgeTone.INDIGO
                          : StatusBadgeTone.SLATE
                      }
                    >
                      {enumLabels.featureKind(featureKind)}
                    </StatusBadge>
                    <FeatureStateControl featureId={feature.id} currentState={feature.currentState} />
                    {feature.suggested && (
                      <StatusBadge tone={StatusBadgeTone.VIOLET}>{t('suggested')}</StatusBadge>
                    )}
                  </div>
                </div>

                {feature.description ? (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                ) : (
                  <p className="max-w-2xl text-sm italic text-muted-foreground/60">
                    {t('detail.noDescription')}
                  </p>
                )}
              </div>

              {feature.tags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('detail.tagsLabel')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {feature.tags.map((tag) => (
                      <TagChip key={tag}>{tag}</TagChip>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        <motion.div variants={slideUp} className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t('detail.releasesHeading')}
          </h2>
          <FeatureDetailTree releases={releases} prs={prs} snapshots={snapshots} />
        </motion.div>
      </motion.div>
    </NebulaBackground>
  )
}
