import { useParams, Link, generatePath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { m, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { AlertCircle, ChevronRight, Flag as FlagIcon } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { useFlagDetail } from '../hooks/use-flag-detail'
import { useRunFlagCoverageForFlag } from '../hooks/use-run-flag-coverage-for-flag'
import { useProject } from '@/context/project.context'
import { FlagStatusHero } from '../components/FlagStatusHero'
import { FlagConflictBanner } from '../components/FlagConflictBanner'
import { FlagEnvironmentsCard } from '../components/FlagEnvironmentsCard'
import { FlagLinkedFeatureCard } from '../components/FlagLinkedFeatureCard'
import { FlagReleaseAppearancesCard } from '../components/FlagReleaseAppearancesCard'
import { FlagHistoryTimeline } from '../components/FlagHistoryTimeline'
import { FlagDetailSkeleton } from '../components/FlagDetailSkeleton'

export default function FlagDetailPage() {
  const { organizationId, flagKey } = useParams<{ organizationId: string; flagKey: string }>()
  const { t } = useTranslation('flags')
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()

  const projectId = activeProject?.id ?? ''

  const { flagDetail, loading, error } = useFlagDetail(projectId, flagKey ?? '')
  const tracked = flagDetail?.tracked ?? null

  const { run: runCoverage, loading: rescanning } = useRunFlagCoverageForFlag(
    projectId,
    flagKey ?? '',
  )

  async function handleRescan(): Promise<void> {
    try {
      await runCoverage()
      toast.success(t('detail.coverage.success'))
    } catch {
      toast.error(t('detail.coverage.error'))
    }
  }

  return (
    <NebulaBackground className="p-6">
      <m.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-6"
      >
        <m.nav
          variants={slideUp}
          aria-label={t('detail.breadcrumb.flags')}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
        >
          <Link
            to={generatePath(ROUTES.PROJECT_FLAGS, {
              organizationId: organizationId ?? '',
              projectId,
            })}
            className="rounded-[var(--radius-button)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('detail.breadcrumb.flags')}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span aria-current="page" className="text-foreground">
            {flagKey}
          </span>
        </m.nav>

        {loading && !flagDetail && (
          <m.div variants={slideUp}>
            <span className="sr-only" role="status">
              {t('detail.loading')}
            </span>
            <FlagDetailSkeleton />
          </m.div>
        )}

        {error && !loading && (
          <m.div variants={slideUp}>
            <GlassCard>
              <CardContent className="flex flex-col items-center gap-4 py-16">
                <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
                  <AlertCircle className="size-7 text-destructive" aria-hidden />
                </div>
                <div className="text-center">
                  <p className="font-display text-lg font-semibold text-foreground">
                    {t('detail.error.heading')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('detail.error.description')}
                  </p>
                </div>
              </CardContent>
            </GlassCard>
          </m.div>
        )}

        {!loading && !error && !flagDetail && (
          <m.div variants={slideUp}>
            <EmptyState
              icon={<FlagIcon className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('detail.notFound.heading')}
              description={t('detail.notFound.description')}
            />
          </m.div>
        )}

        {flagDetail && (
          <>
            {flagDetail.hasConflict && (
              <m.div variants={slideUp}>
                <FlagConflictBanner />
              </m.div>
            )}

            <m.div variants={slideUp}>
              <FlagStatusHero
                flagKey={flagDetail.key}
                deploymentStatus={flagDetail.deploymentStatus}
                tracked={tracked}
                onRescan={() => void handleRescan()}
                rescanning={rescanning}
              />
            </m.div>

            <m.div
              variants={slideUp}
              className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_1fr]"
            >
              <FlagEnvironmentsCard environments={flagDetail.flagsmith.environments} />

              <div className="space-y-4">
                <FlagLinkedFeatureCard feature={tracked?.feature ?? null} />
                {tracked && (
                  <FlagReleaseAppearancesCard
                    releases={tracked.releases}
                    trackedFlagId={tracked.id}
                  />
                )}
              </div>
            </m.div>

            <m.div variants={slideUp}>
              <FlagHistoryTimeline projectId={projectId} flagKey={flagDetail.key} />
            </m.div>
          </>
        )}
      </m.div>
    </NebulaBackground>
  )
}
