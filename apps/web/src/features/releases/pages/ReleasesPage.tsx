import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { motion } from 'motion/react'
import { AlertCircle, ArrowRight, Loader2, Rocket } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { PageHeader } from '@/components/nebula/PageHeader'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/context/ability.context'
import { useProject } from '@/context/project.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { GET_RELEASES } from '../graphql/releases.queries'
import { DeleteReleaseButton } from '../components/DeleteReleaseButton'
import type { GetReleasesQuery, ReleaseStatus } from '@/generated/graphql'

type ReleaseItem = GetReleasesQuery['getReleases'][number]

const statusColorMap: Record<ReleaseStatus, string> = {
  DRAFT: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  PR_CREATED: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  MERGED: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  DEPLOYED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
}

interface ReleaseRowProps {
  release: ReleaseItem
  projectId: string
}

function ReleaseRow({ release, projectId }: ReleaseRowProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const detailPath = ROUTES.RELEASE_DETAIL.replace(':releaseId', release.id)

  const statusClasses = statusColorMap[release.status]
  const statusLabel = enumLabels.releaseStatus(release.status)

  const formattedDate = new Date(release.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const releaseLabel = release.name ?? `${release.baseRef} → ${release.compareRef}`

  return (
    <motion.li variants={slideUp} className="relative">
      <Link
        to={detailPath}
        aria-label={t('list.viewRelease')}
        className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground transition-colors group-hover:text-white">
              {release.name}
            </span>
            <Badge className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses}`}>
              {statusLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{release.baseRef}</span>
            <span>→</span>
            <span className="font-mono">{release.compareRef}</span>
            <span>·</span>
            <time dateTime={release.createdAt}>{formattedDate}</time>
          </div>
        </div>

        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>

      <div
        className="absolute right-10 top-1/2 -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <DeleteReleaseButton
          releaseId={release.id}
          projectId={projectId}
          releaseLabel={releaseLabel}
          variant="icon"
        />
      </div>
    </motion.li>
  )
}

export default function ReleasesPage() {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const { activeProject } = useProject()

  const { data, loading, error } = useQuery(GET_RELEASES, {
    variables: { projectId: activeProject?.id ?? '' },
    skip: !activeProject,
  })

  const releases: ReleaseItem[] = data?.getReleases ?? []

  const body = (() => {
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
                {t('list.error.heading')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('list.error.description')}
              </p>
            </div>
          </CardContent>
        </GlassCard>
      )
    }

    if (releases.length === 0) {
      return (
        <EmptyState
          icon={<Rocket className="size-7 text-brand-indigo-bright" aria-hidden />}
          heading={t('empty.heading')}
          description={t('empty.description')}
        />
      )
    }

    return (
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2"
        role="list"
      >
        {releases.map((release) => (
          <ReleaseRow key={release.id} release={release} projectId={activeProject?.id ?? ''} />
        ))}
      </motion.ul>
    )
  })()

  return (
    <NebulaBackground className="p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          overline={t('subtitle')}
          title={t('title')}
          actions={
            <Can I={Action.CREATE} a={Subject.RELEASE}>
              <GradientButton onClick={() => navigate(ROUTES.RELEASE_BUILDER)}>
                <Rocket className="mr-2 size-4" />
                {t('new')}
              </GradientButton>
            </Can>
          }
        />

        {body}
      </div>
    </NebulaBackground>
  )
}
