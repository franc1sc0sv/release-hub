import { useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { useProject } from '@/context/project.context'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import { AiDraftStatusValue, ReleaseStatusValue } from '../constants/release-enums'
import { OverviewTab } from '../components/OverviewTab'
import { DraftTab } from '../components/DraftTab'
import { SummaryTab } from '../components/SummaryTab'
import { DeleteReleaseButton } from '../components/DeleteReleaseButton'
import { ReleaseStatusControl } from '../components/ReleaseStatusControl'

const POLL_INTERVAL_MS = 3000
const DRAFTING_STATUSES = new Set<string>([
  AiDraftStatusValue.PENDING,
  AiDraftStatusValue.RUNNING,
])

export default function ReleaseViewPage() {
  const { releaseId } = useParams<{ releaseId: string }>()
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()

  const queryResult = useQuery(GET_RELEASE_TREE, {
    variables: { id: releaseId ?? '' },
    skip: !releaseId,
    pollInterval: POLL_INTERVAL_MS,
  })

  const { data, loading, error } = queryResult

  const pollingRef = useRef(true)

  useEffect(() => {
    const aiStatus = data?.getReleaseTree?.release?.aiDraftStatus
    if (aiStatus && !DRAFTING_STATUSES.has(aiStatus) && pollingRef.current) {
      queryResult.stopPolling()
      pollingRef.current = false
    }
  }, [data, queryResult])

  if (loading && !data) {
    return (
      <NebulaBackground className="p-6">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="size-8 animate-spin text-indigo-400" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('view.loading')}</p>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  if (error || !data?.getReleaseTree) {
    return (
      <NebulaBackground className="p-6">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="size-7 text-destructive" aria-hidden />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {t('view.error.heading')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('view.error.description')}
              </p>
            </div>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  const { release, features } = data.getReleaseTree
  const projectId = activeProject?.id ?? release.projectId
  const isDraftStatus = release.status === ReleaseStatusValue.DRAFT

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
            to={ROUTES.RELEASES}
            className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {t('view.back')}
          </Link>
        </motion.div>

        <motion.div variants={slideUp} className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-overline uppercase tracking-widest text-muted-foreground">
              {t('view.subtitle')}
            </p>
            <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
              {release.name ?? `${release.baseRef} → ${release.compareRef}`}
            </h1>
            <ReleaseStatusControl releaseId={release.id} currentStatus={release.status} />
          </div>

          <DeleteReleaseButton
            releaseId={release.id}
            projectId={projectId}
            releaseLabel={release.name ?? `${release.baseRef} → ${release.compareRef}`}
            status={release.status}
            onDeleted={() => navigate(ROUTES.RELEASES)}
            variant="icon"
          />
        </motion.div>

        <motion.div variants={slideUp}>
          <Tabs defaultValue="overview">
            <TabsList
              variant="line"
              className="mb-6"
              aria-label={t('view.tabs.label')}
            >
              <TabsTrigger value="overview">
                {t('view.tabs.overview')}
              </TabsTrigger>
              {isDraftStatus && (
                <TabsTrigger value="draft">
                  {t('view.tabs.draft')}
                </TabsTrigger>
              )}
              <TabsTrigger value="summary">
                {t('view.tabs.summary')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab release={release} features={features} />
            </TabsContent>

            {isDraftStatus && (
              <TabsContent value="draft">
                <DraftTab
                  release={release}
                  features={features}
                  projectId={projectId}
                />
              </TabsContent>
            )}

            <TabsContent value="summary">
              <SummaryTab release={release} features={features} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </NebulaBackground>
  )
}
