import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { AlertCircle, ChevronRight, Flag as FlagIcon } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { EmptyState } from '@/components/nebula/EmptyState'
import { CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { TRACKED_FLAG } from '../graphql/flags.queries'
import { useRunFlagCoverageForFlag } from '../hooks/use-run-flag-coverage-for-flag'
import { useProject } from '@/context/project.context'
import { FlagStatusHero } from '../components/FlagStatusHero'
import { FlagBranchPresenceSection } from '../components/FlagBranchPresenceSection'
import { FlagLinkedFeatureCard } from '../components/FlagLinkedFeatureCard'
import { FlagReleaseAppearancesCard } from '../components/FlagReleaseAppearancesCard'
import { FlagPullRequestChangesCard } from '../components/FlagPullRequestChangesCard'
import { FlagDecisionTimeline } from '../components/FlagDecisionTimeline'
import { FlagDetailSkeleton } from '../components/FlagDetailSkeleton'

export default function FlagDetailPage() {
  const { flagKey } = useParams<{ flagKey: string }>()
  const { t } = useTranslation('flags')
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()

  const projectId = activeProject?.id ?? ''

  const { data, loading, error } = useQuery(TRACKED_FLAG, {
    variables: { projectId, key: flagKey ?? '' },
    skip: !projectId || !flagKey,
    fetchPolicy: 'cache-and-network',
  })

  const flag = data?.trackedFlag

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
      <motion.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-7xl space-y-6"
      >
        <motion.nav
          variants={slideUp}
          aria-label={t('detail.breadcrumb.flags')}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
        >
          <Link
            to={ROUTES.FLAGS}
            className="rounded-[var(--radius-button)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('detail.breadcrumb.flags')}
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <span aria-current="page" className="text-foreground">
            {flagKey}
          </span>
        </motion.nav>

        {loading && !data && (
          <motion.div variants={slideUp}>
            <span className="sr-only" role="status">
              {t('detail.loading')}
            </span>
            <FlagDetailSkeleton />
          </motion.div>
        )}

        {error && !loading && (
          <motion.div variants={slideUp}>
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
          </motion.div>
        )}

        {!loading && !error && !flag && (
          <motion.div variants={slideUp}>
            <EmptyState
              icon={<FlagIcon className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('detail.notFound.heading')}
              description={t('detail.notFound.description')}
            />
          </motion.div>
        )}

        {flag && (
          <>
            <motion.div variants={slideUp}>
              <FlagStatusHero
                flag={flag}
                onRescan={() => void handleRescan()}
                rescanning={rescanning}
              />
            </motion.div>

            <motion.div
              variants={slideUp}
              className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_1fr]"
            >
              <div className="space-y-4">
                <FlagBranchPresenceSection
                  branches={flag.branchPresences}
                  onRescan={() => void handleRescan()}
                  rescanning={rescanning}
                />
                <FlagPullRequestChangesCard
                  changes={flag.pullRequestChanges}
                  repo={activeProject?.repo ?? null}
                />
                <FlagDecisionTimeline releases={flag.releases} events={flag.events} />
              </div>

              <div className="space-y-4">
                <FlagLinkedFeatureCard feature={flag.feature} />
                <FlagReleaseAppearancesCard releases={flag.releases} />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </NebulaBackground>
  )
}
