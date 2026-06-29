import { useTranslation } from 'react-i18next'
import { FolderOpen, Plus, Wifi } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { EmptyState } from '@/components/nebula/EmptyState'
import { PageHeader } from '@/components/nebula/PageHeader'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/context/project.context'
import { ConnectionHealthIndicator } from '@/features/workspace/components/ConnectionHealthIndicator'
import { GITHUB_CONNECTION, LINEAR_CONNECTION } from '@/features/settings/graphql/settings.operations'
import { staggerContainer, slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import type { IntegrationStatus } from '@/generated/graphql'

const CONNECTED: IntegrationStatus = 'CONNECTED'
const NOT_CONFIGURED: IntegrationStatus = 'NOT_CONFIGURED'

export default function WorkspacePage() {
  const { t } = useTranslation('workspace')
  const { activeProject, loading: projectLoading } = useProject()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

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

  const containerVariants = reducedMotion ? {} : staggerContainer
  const itemVariants = reducedMotion ? {} : slideUp

  return (
    <NebulaBackground className="p-6">
      <motion.div
        className="mx-auto max-w-7xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <PageHeader
            overline={t('subtitle')}
            title={t('title')}
            actions={
              <GradientButton
                onClick={() => navigate(ROUTES.PROJECT_CREATE)}
                aria-label={t('newProject')}
              >
                <Plus className="size-4" aria-hidden />
                {t('newProject')}
              </GradientButton>
            }
          />
        </motion.div>

        {loading && (
          <motion.div variants={itemVariants}>
            <GlassCard>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40 rounded" />
              </CardHeader>
              <CardContent className="space-y-2 pb-6">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </GlassCard>
          </motion.div>
        )}

        {!loading && !activeProject && (
          <motion.div variants={itemVariants}>
            <EmptyState
              icon={<FolderOpen className="size-7 text-brand-indigo-bright" aria-hidden />}
              heading={t('empty.heading')}
              description={t('empty.description')}
            />
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
