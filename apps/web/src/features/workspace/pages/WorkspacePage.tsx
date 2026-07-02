import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Github, Plus, Wifi } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { Scene3D } from '@/components/three/Scene3D'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/context/project.context'
import { ConnectionHealthIndicator } from '@/features/workspace/components/ConnectionHealthIndicator'
import { GITHUB_CONNECTION, LINEAR_CONNECTION } from '@/features/settings/graphql/settings.operations'
import { staggerContainer, slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import type { IntegrationStatus, ListProjectsQuery } from '@/generated/graphql'

const CONNECTED: IntegrationStatus = 'CONNECTED'
const NOT_CONFIGURED: IntegrationStatus = 'NOT_CONFIGURED'

type ProjectItem = ListProjectsQuery['listProjects'][number]

function HeroVisualSlot() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-56 shrink-0">
      <Scene3D scene="releaseCapsule" className="rounded-[var(--radius-card)]" />
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectItem
  onSelect: (id: string) => void
}

function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const { t } = useTranslation('workspace')

  const connectedCount = [
    project.integrations.github,
    project.integrations.linear,
    project.integrations.flagsmith,
  ].filter(Boolean).length

  return (
    <motion.div variants={slideUp}>
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[var(--radius-card)]"
      >
        <GlassCard className="h-full transition-all duration-300 group-hover:border-white/20 group-hover:shadow-glow-indigo">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-brand-indigo-bright/15">
                <FolderOpen className="size-5 text-brand-indigo-bright" aria-hidden />
              </div>
              <StatusBadge
                tone={connectedCount > 0 ? StatusBadgeTone.EMERALD : StatusBadgeTone.SLATE}
                icon={Github}
              >
                {t('projectCard.integrationsCount', { count: connectedCount, total: 3 })}
              </StatusBadge>
            </div>
            <h2 className="mt-3 truncate font-display text-lg font-semibold text-foreground">
              {project.name}
            </h2>
            <p className="truncate font-mono text-xs text-muted-foreground">{project.repo}</p>
          </CardHeader>
          <CardContent className="pb-5">
            <p className="text-sm text-muted-foreground">{t('projectCard.openHint')}</p>
          </CardContent>
        </GlassCard>
      </button>
    </motion.div>
  )
}

export default function WorkspacePage() {
  const { t } = useTranslation('workspace')
  const { projects, activeProject, setActiveProjectId, loading: projectLoading } = useProject()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion() ?? false
  const [search, setSearch] = useState('')

  const { data: githubData, loading: githubLoading } = useQuery(GITHUB_CONNECTION, {
    fetchPolicy: 'cache-and-network',
  })
  const { data: linearData, loading: linearLoading } = useQuery(LINEAR_CONNECTION, {
    variables: { projectId: activeProject?.id ?? '' },
    skip: !activeProject,
    fetchPolicy: 'cache-and-network',
  })

  const loading = projectLoading || githubLoading || linearLoading

  const github: IntegrationStatus = githubData?.githubConnection.connected ? CONNECTED : NOT_CONFIGURED
  const linear: IntegrationStatus = linearData?.linearConnection?.connected ? CONNECTED : NOT_CONFIGURED
  const flagsmith: IntegrationStatus = activeProject?.connectionHealth.flagsmith ?? NOT_CONFIGURED

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) || project.repo.toLowerCase().includes(query),
    )
  }, [projects, search])

  const containerVariants = reducedMotion ? {} : staggerContainer
  const itemVariants = reducedMotion ? {} : slideUp

  return (
    <NebulaBackground className="p-6">
      <motion.div
        className="mx-auto max-w-7xl space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <GlassCard glow="indigo">
            <CardContent className="flex flex-col items-center gap-8 py-10 sm:flex-row sm:justify-between">
              <div className="min-w-0 space-y-4 text-center sm:text-left">
                <p className="text-overline uppercase tracking-widest text-muted-foreground">
                  {t('subtitle')}
                </p>
                <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
                  {activeProject
                    ? t('hero.greetingWithProject', { name: activeProject.name })
                    : t('hero.greeting')}
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">{t('hero.description')}</p>
                <GradientButton
                  onClick={() => navigate(ROUTES.PROJECT_CREATE)}
                  aria-label={t('newProject')}
                >
                  <Plus className="size-4" aria-hidden />
                  {t('newProject')}
                </GradientButton>
              </div>
              <HeroVisualSlot />
            </CardContent>
          </GlassCard>
        </motion.div>

        {loading && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[0, 1, 2].map((key) => (
              <GlassCard key={key}>
                <CardHeader className="pb-2">
                  <Skeleton className="size-10 rounded-[var(--radius-button)]" />
                  <Skeleton className="mt-3 h-5 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </CardHeader>
                <CardContent className="pb-5">
                  <Skeleton className="h-4 w-full rounded" />
                </CardContent>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {!loading && projects.length === 0 && (
          <motion.div variants={itemVariants}>
            <EmptyState
              icon={<FolderOpen className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('empty.heading')}
              description={t('empty.description')}
              action={
                <GradientButton onClick={() => navigate(ROUTES.PROJECT_CREATE)}>
                  <Plus className="size-4" aria-hidden />
                  {t('empty.cta')}
                </GradientButton>
              }
            />
          </motion.div>
        )}

        {!loading && projects.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-display-md font-semibold text-foreground">
                {t('projectsHeading')}
              </h2>
              <SearchField
                value={search}
                onValueChange={setSearch}
                placeholder={t('searchPlaceholder')}
                className="w-full max-w-xs"
              />
            </div>

            {filteredProjects.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="size-7 text-brand-indigo-bright" aria-hidden />}
                heading={t('noResults.heading')}
                description={t('noResults.description')}
              />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onSelect={setActiveProjectId} />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {!loading && activeProject && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Wifi className="size-4 text-muted-foreground" aria-hidden />
                  <h2 className="text-sm font-semibold text-foreground">
                    {t('connectionHealth.title')}
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ConnectionHealthIndicator
                  github={github}
                  linear={linear}
                  flagsmith={flagsmith}
                />
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </NebulaBackground>
  )
}
