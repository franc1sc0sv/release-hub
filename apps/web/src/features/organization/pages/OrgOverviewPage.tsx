import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Github, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { generatePath, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { SearchField } from '@/components/nebula/SearchField'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/context/organization.context'
import { useGithubConnection } from '@/features/settings/hooks/use-github-connection'
import { LIST_PROJECTS } from '@/features/workspace/graphql/workspace.queries'
import { staggerContainer, slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import type { ListProjectsQuery } from '@/generated/graphql'

type ProjectItem = ListProjectsQuery['listProjects'][number]

interface ProjectCardProps {
  project: ProjectItem
  onSelect: (id: string) => void
}

function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const { t } = useTranslation('workspace')

  const connectedCount =
    1 +
    [project.integrations.linear, project.integrations.flagsmith, project.integrations.slack].filter(Boolean)
      .length

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
                {t('projectCard.integrationsCount', { count: connectedCount, total: 4 })}
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

export default function OrgOverviewPage() {
  const { t } = useTranslation('workspace')
  const { t: tOrg } = useTranslation('organization')
  const { activeOrg } = useOrganization()
  const { installViaApp } = useGithubConnection()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion() ?? false
  const [search, setSearch] = useState('')

  const { data, loading } = useQuery(LIST_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  })

  const projects = useMemo(
    () => (data?.listProjects ?? []).filter((project) => project.organizationId === activeOrg?.id),
    [data, activeOrg],
  )

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

  if (!activeOrg) return null

  const organizationId = activeOrg.id

  function handleSelectProject(projectId: string): void {
    navigate(generatePath(ROUTES.PROJECT_ROOT, { organizationId, projectId }))
  }

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
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-overline uppercase tracking-widest text-muted-foreground">
                {tOrg('switcher.eyebrow')}
              </p>
              <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
                {activeOrg.name}
              </h1>
              <StatusBadge
                tone={activeOrg.githubConnected ? StatusBadgeTone.EMERALD : StatusBadgeTone.AMBER}
                icon={Github}
              >
                {activeOrg.githubConnected ? tOrg('github.connected') : tOrg('github.notConnected')}
              </StatusBadge>
              <p className="max-w-md text-sm text-muted-foreground">{tOrg('overview.description')}</p>
              {activeOrg.githubConnected && (
                <GradientButton
                  onClick={() =>
                    navigate(generatePath(ROUTES.PROJECT_CREATE, { organizationId }))
                  }
                  aria-label={t('newProject')}
                >
                  <Plus className="size-4" aria-hidden />
                  {t('newProject')}
                </GradientButton>
              )}
            </CardContent>
          </GlassCard>
        </motion.div>

        {!activeOrg.githubConnected ? (
          <motion.div variants={itemVariants}>
            <EmptyState
              icon={<Github className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('connectGithub.heading')}
              description={t('connectGithub.description')}
              action={
                <div className="flex flex-col items-center gap-3">
                  <GradientButton
                    onClick={() => void installViaApp({ organizationId })}
                  >
                    <Github className="size-4" aria-hidden />
                    {t('connectGithub.cta')}
                  </GradientButton>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => navigate(ROUTES.ONBOARDING)}
                  >
                    {t('connectGithub.retake')}
                  </Button>
                </div>
              }
            />
          </motion.div>
        ) : (
          <>
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
                    <GradientButton
                      onClick={() =>
                        navigate(generatePath(ROUTES.PROJECT_CREATE, { organizationId }))
                      }
                    >
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
                      <ProjectCard key={project.id} project={project} onSelect={handleSelectProject} />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </NebulaBackground>
  )
}
