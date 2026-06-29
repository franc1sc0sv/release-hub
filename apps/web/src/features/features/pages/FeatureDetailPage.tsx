import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowLeft, AlertCircle, Loader2, GitBranch } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import {
  FeatureKindValue,
  FEATURE_STATE_BADGE_CLASS,
} from '../constants/feature-enums'
import { useFeature } from '../hooks/useFeature'
import { FeatureDetailTree } from '../components/FeatureDetailTree'
import type { FeatureKind, FeatureState } from '@/generated/graphql'

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const { detail, loading, error } = useFeature(id)

  if (loading) {
    return (
      <NebulaBackground className="p-6">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="size-8 animate-spin text-indigo-400" />
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  if (error) {
    return (
      <NebulaBackground className="p-6">
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
      </NebulaBackground>
    )
  }

  if (!detail) {
    return (
      <NebulaBackground className="p-6">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/5">
              <GitBranch className="size-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {t('detail.notFound')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('detail.notFoundDescription')}
              </p>
            </div>
            <Link
              to={ROUTES.FEATURES}
              className="rounded-[var(--radius-button)] border border-white/20 bg-white/5 px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('back')}
            </Link>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  const { feature, releases, prs } = detail
  const featureKind = feature.kind as FeatureKind
  const featureState = feature.currentState as FeatureState | null

  return (
    <NebulaBackground className="p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-full space-y-8"
      >
        <motion.div variants={slideUp}>
          <Link
            to={ROUTES.FEATURES}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-3.5" />
            {t('back')}
          </Link>
        </motion.div>

        <motion.div variants={slideUp}>
          <GlassCard>
            <CardContent className="space-y-5 py-6">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {t('subtitle')}
                </p>

                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
                    {feature.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge
                      variant={featureKind === FeatureKindValue.PRODUCT ? 'outline' : 'secondary'}
                      className="rounded-full"
                    >
                      {enumLabels.featureKind(featureKind)}
                    </Badge>
                    {featureState && (
                      <Badge
                        variant="outline"
                        className={`rounded-full border ${FEATURE_STATE_BADGE_CLASS[featureState]}`}
                      >
                        {enumLabels.featureState(featureState)}
                      </Badge>
                    )}
                    {feature.suggested && (
                      <Badge className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300">
                        {t('suggested')}
                      </Badge>
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
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-foreground/70"
                      >
                        {tag}
                      </span>
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
          <FeatureDetailTree releases={releases} prs={prs} />
        </motion.div>
      </motion.div>
    </NebulaBackground>
  )
}
