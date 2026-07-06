import { useTranslation } from 'react-i18next'
import { useNavigate, generatePath } from 'react-router-dom'
import { m, useReducedMotion } from 'motion/react'
import { Github, Loader2 } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import { useProject } from '@/context/project.context'
import { useOrganization } from '@/context/organization.context'
import { ReleaseWizard } from '../components/ReleaseWizard'

export default function ReleaseBuilderPage() {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()

  const { activeOrg, loading: githubLoading } = useOrganization()
  const githubConnected = activeOrg?.githubConnected ?? false

  return (
    <NebulaBackground className="p-6">
      <m.div
        variants={slideUp}
        initial={reduceMotion ? 'visible' : 'hidden'}
        animate="visible"
        className="mx-auto max-w-4xl space-y-8"
      >
        <div>
          <p className="text-overline uppercase tracking-widest text-muted-foreground">
            {t('subtitle')}
          </p>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {t('builder.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('wizard.subtitle')}</p>
        </div>

        {githubLoading ? (
          <GlassCard>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
            </CardContent>
          </GlassCard>
        ) : !githubConnected ? (
          <GithubNotConnected />
        ) : (
          <ReleaseWizard />
        )}
      </m.div>
    </NebulaBackground>
  )
}

function GithubNotConnected() {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()
  const { activeProject } = useProject()

  return (
    <GlassCard glow="indigo">
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/20">
          <Github className="size-7 text-indigo-400" aria-hidden />
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-foreground">
            {t('builder.githubNotConnected.heading')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('builder.githubNotConnected.description')}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            activeProject &&
            navigate(
              generatePath(ROUTES.PROJECT_SETTINGS, {
                organizationId: activeProject.organizationId,
                projectId: activeProject.id,
              }),
            )
          }
        >
          {t('builder.githubNotConnected.cta')}
        </Button>
      </CardContent>
    </GlassCard>
  )
}
