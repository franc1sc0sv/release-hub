import { useState } from 'react'
import { useParams, useNavigate, generatePath } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { m, useReducedMotion } from 'motion/react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import { slideUp, staggerContainer } from '@/lib/animations'
import { useProject } from '@/context/project.context'
import { useAutoCollapsedSidebar } from '@/hooks/use-auto-collapsed-sidebar'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import { AiDraftStatusValue, AiSummaryStatusValue, ReleaseStatusValue } from '../constants/release-enums'
import { ReleaseSectionValue } from '../constants/release-sections'
import type { ReleaseSection } from '../constants/release-sections'
import { useReleaseSection } from '../hooks/useReleaseSection'
import { useReleaseWorkspaceStats } from '../hooks/useReleaseWorkspaceStats'
import { ReleaseWorkspaceHeader } from '../components/ReleaseWorkspaceHeader'
import { ReleaseSectionNav } from '../components/ReleaseSectionNav'
import type { IReleaseSectionNavItem } from '../components/ReleaseSectionNav'
import { ReleaseReadinessCard } from '../components/ReleaseReadinessCard'
import { NewPrsReviewPanel } from '../components/NewPrsReviewPanel'
import { AssignPrsSection } from '../components/AssignPrsSection'
import { ReleaseFeaturesSection } from '../components/ReleaseFeaturesSection'
import { ReleasePrsSection } from '../components/ReleasePrsSection'
import { ReleaseFlagsSection } from '../components/ReleaseFlagsSection'
import { CarryOverDecisionsSection } from '../components/CarryOverDecisionsSection'
import { ReleaseSummarySection } from '../components/ReleaseSummarySection'
import type { AiDraftStatus, AiSummaryStatus, GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseTree = GetReleaseTreeQuery['getReleaseTree']

const POLL_INTERVAL_MS = 3000
const DRAFTING_STATUSES = new Set<string>([AiDraftStatusValue.PENDING, AiDraftStatusValue.RUNNING])

function CountBadge({ value }: { value: number }) {
  return <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}</span>
}

interface ReleaseWorkspaceProps {
  tree: ReleaseTree
  projectId: string
  releasesPath: string
}

function ReleaseWorkspace({ tree, projectId, releasesPath }: ReleaseWorkspaceProps) {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const { release, features } = tree
  const isDraft = release.status === ReleaseStatusValue.DRAFT
  const stats = useReleaseWorkspaceStats(release, features)
  const { section, available, selectSection } = useReleaseSection(isDraft)

  function buildNavItem(entry: ReleaseSection): IReleaseSectionNavItem {
    switch (entry) {
      case ReleaseSectionValue.ASSIGN:
        return {
          section: entry,
          label: t('workspace.sections.assign'),
          badge: <CountBadge value={stats.coverage.total - stats.coverage.assigned} />,
        }
      case ReleaseSectionValue.FEATURES:
        return { section: entry, label: t('workspace.sections.features'), badge: <CountBadge value={stats.featureCount} /> }
      case ReleaseSectionValue.PRS:
        return { section: entry, label: t('workspace.sections.prs'), badge: <CountBadge value={stats.prCount} /> }
      case ReleaseSectionValue.FLAGS:
        return { section: entry, label: t('workspace.sections.flags'), badge: <CountBadge value={stats.releaseFlagCount} /> }
      case ReleaseSectionValue.CARRY_OVER:
        return {
          section: entry,
          label: t('workspace.sections.carryOver'),
          badge:
            stats.openCarryOverCount > 0 ? (
              <StatusBadge tone={StatusBadgeTone.AMBER}>{stats.openCarryOverCount}</StatusBadge>
            ) : (
              <CountBadge value={0} />
            ),
        }
      case ReleaseSectionValue.SUMMARY:
        return {
          section: entry,
          label: t('workspace.sections.summary'),
          badge: stats.hasSummary ? (
            <StatusBadge tone={StatusBadgeTone.EMERALD}>{t('workspace.summaryReady')}</StatusBadge>
          ) : (
            <StatusBadge tone={StatusBadgeTone.SLATE}>{t('workspace.summaryMissing')}</StatusBadge>
          ),
        }
    }
  }

  const navItems = available.map(buildNavItem)

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <ReleaseWorkspaceHeader
        release={release}
        stats={stats}
        projectId={projectId}
        releasesPath={releasesPath}
        onDeleted={() => navigate(releasesPath)}
      />

      <NewPrsReviewPanel release={release} features={features} projectId={projectId} />

      <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-4 lg:overflow-y-auto">
          <ReleaseSectionNav items={navItems} active={section} onSelect={selectSection} />
          <div className="hidden lg:block">
            <ReleaseReadinessCard stats={stats} />
          </div>
        </aside>

        <main className="min-w-0 lg:overflow-y-auto lg:pr-2">
          {section === ReleaseSectionValue.ASSIGN && (
            <AssignPrsSection release={release} features={features} projectId={projectId} />
          )}
          {section === ReleaseSectionValue.FEATURES && (
            <ReleaseFeaturesSection features={features} releaseId={release.id} stateBreakdown={stats.stateBreakdown} />
          )}
          {section === ReleaseSectionValue.PRS && <ReleasePrsSection features={features} />}
          {section === ReleaseSectionValue.FLAGS && (
            <ReleaseFlagsSection releaseId={release.id} releaseStatus={release.status} />
          )}
          {section === ReleaseSectionValue.CARRY_OVER && <CarryOverDecisionsSection releaseId={release.id} releaseName={release.name ?? `${release.baseRef} → ${release.compareRef}`} />}
          {section === ReleaseSectionValue.SUMMARY && <ReleaseSummarySection release={release} features={features} />}
        </main>
      </div>
    </div>
  )
}

export default function ReleaseViewPage() {
  const { organizationId, releaseId } = useParams<{ organizationId: string; releaseId: string }>()
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()
  const { activeProject } = useProject()
  useAutoCollapsedSidebar()

  const [knownAiStatus, setKnownAiStatus] = useState<AiDraftStatus | undefined>(undefined)
  const [knownSummaryStatus, setKnownSummaryStatus] = useState<AiSummaryStatus | undefined>(undefined)
  const isDrafting = !knownAiStatus || DRAFTING_STATUSES.has(knownAiStatus)
  const isSummaryGenerating = knownSummaryStatus === AiSummaryStatusValue.GENERATING
  const pollInterval = isDrafting || isSummaryGenerating ? POLL_INTERVAL_MS : 0

  const { data, loading, error } = useQuery(GET_RELEASE_TREE, {
    variables: { id: releaseId ?? '' },
    skip: !releaseId,
    pollInterval,
  })

  const aiStatus = data?.getReleaseTree?.release?.aiDraftStatus
  if (aiStatus !== knownAiStatus) {
    setKnownAiStatus(aiStatus)
  }

  const summaryStatus = data?.getReleaseTree?.release?.summaryStatus
  if (summaryStatus !== knownSummaryStatus) {
    setKnownSummaryStatus(summaryStatus)
  }

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
              <p className="font-display text-lg font-semibold text-foreground">{t('view.error.heading')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('view.error.description')}</p>
            </div>
          </CardContent>
        </GlassCard>
      </NebulaBackground>
    )
  }

  const tree = data.getReleaseTree
  const projectId = activeProject?.id ?? tree.release.projectId
  const releasesPath = generatePath(ROUTES.PROJECT_RELEASES, {
    organizationId: organizationId ?? '',
    projectId,
  })

  return (
    <NebulaBackground className="h-full">
      <m.div
        variants={staggerContainer}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto h-full max-w-7xl"
      >
        <m.div variants={slideUp} className="h-full">
          <ReleaseWorkspace tree={tree} projectId={projectId} releasesPath={releasesPath} />
        </m.div>
      </m.div>
    </NebulaBackground>
  )
}
