import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link, generatePath } from 'react-router-dom'
import { m } from 'motion/react'
import { AlertCircle, ArrowRight, Loader2, Rocket } from 'lucide-react'
import { PageShell } from '@/components/nebula/PageShell'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { CardContent } from '@/components/ui/card'
import { Can } from '@/context/ability.context'
import { useProject } from '@/context/project.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { staggerContainer, slideUp } from '@/lib/animations'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { useInfiniteList } from '@/hooks/use-infinite-list'
import { GET_RELEASES_PAGE } from '../graphql/releases.queries'
import { DeleteReleaseButton } from '../components/DeleteReleaseButton'
import { releaseStatusTone } from '../constants/release-enums'
import type { GetReleasesPageQuery } from '@/generated/graphql'

type ReleaseItem = GetReleasesPageQuery['getReleasesPage']['items'][number]

interface ReleaseRowProps {
  release: ReleaseItem
  organizationId: string
  projectId: string
}

function ReleaseRow({ release, organizationId, projectId }: ReleaseRowProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const detailPath = generatePath(ROUTES.PROJECT_RELEASE_DETAIL, {
    organizationId,
    projectId,
    releaseId: release.id,
  })

  const statusLabel = enumLabels.releaseStatus(release.status)

  const formattedDate = new Date(release.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const releaseLabel = release.name ?? `${release.baseRef} → ${release.compareRef}`

  return (
    <m.li variants={slideUp} className="relative">
      <Link
        to={detailPath}
        aria-label={t('list.viewRelease')}
        className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-5 py-4 transition-colors duration-200 hover:border-white/20 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground transition-colors group-hover:text-white">
              {releaseLabel}
            </span>
            <StatusBadge tone={releaseStatusTone(release.status)}>{statusLabel}</StatusBadge>
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
          status={release.status}
          variant="icon"
        />
      </div>
    </m.li>
  )
}

function ReleaseRowSkeleton() {
  return <Skeleton className="h-[68px] w-full rounded-[var(--radius-card)]" />
}

export default function ReleasesPage() {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const { activeProject } = useProject()
  const [search, setSearch] = useState('')

  const variables = useMemo(
    () => ({
      projectId: activeProject?.id ?? '',
      search: search || undefined,
    }),
    [activeProject?.id, search],
  )

  const { items, loadingInitial, loadingMore, error, sentinelRef } = useInfiniteList({
    query: GET_RELEASES_PAGE,
    variables,
    selectPage: (data) => data.getReleasesPage,
    skip: !activeProject,
  })

  const projectId = activeProject?.id ?? ''
  const organizationId = activeProject?.organizationId ?? ''

  const body = (() => {
    if (loadingInitial) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <ReleaseRowSkeleton key={index} />
          ))}
        </div>
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

    if (items.length === 0) {
      return (
        <EmptyState
          icon={<Rocket className="size-7 text-brand-indigo-bright" aria-hidden />}
          heading={search ? t('list.noResults.heading') : t('empty.heading')}
          description={search ? t('list.noResults.description') : t('empty.description')}
        />
      )
    }

    return (
      <m.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2"
        role="list"
      >
        {items.map((release) => (
          <ReleaseRow
            key={release.id}
            release={release}
            organizationId={organizationId}
            projectId={projectId}
          />
        ))}
      </m.ul>
    )
  })()

  return (
    <PageShell
      eyebrow={t('subtitle')}
      title={t('title')}
      actions={
        <Can I={Action.CREATE} a={Subject.RELEASE}>
          <GradientButton
            onClick={() =>
              navigate(generatePath(ROUTES.PROJECT_RELEASE_BUILDER, { organizationId, projectId }))
            }
          >
            <Rocket className="mr-2 size-4" />
            {t('new')}
          </GradientButton>
        </Can>
      }
    >
      <div className="space-y-4">
        <SearchField
          value={search}
          onValueChange={setSearch}
          placeholder={t('list.searchPlaceholder')}
          className="max-w-xs"
        />

        {body}

        {!loadingInitial && !error && items.length > 0 && (
          <div ref={sentinelRef} aria-hidden className="h-1" />
        )}

        {loadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 className="size-5 animate-spin text-indigo-400" aria-hidden />
          </div>
        )}
      </div>
    </PageShell>
  )
}
