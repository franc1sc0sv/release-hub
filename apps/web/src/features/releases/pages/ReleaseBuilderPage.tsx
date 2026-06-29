import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { motion, useReducedMotion } from 'motion/react'
import { Github, Loader2 } from 'lucide-react'
import { NebulaBackground } from '@/components/nebula/NebulaBackground'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GITHUB_CONNECTION } from '@/features/settings/graphql/settings.operations'
import { slideUp } from '@/lib/animations'
import { ROUTES } from '@/lib/routes'
import { ReleaseWizard } from '../components/ReleaseWizard'

export default function ReleaseBuilderPage() {
  const { t } = useTranslation('releases')
  const reduceMotion = useReducedMotion()

  const { data: githubData, loading: githubLoading } = useQuery(GITHUB_CONNECTION, {
    fetchPolicy: 'cache-and-network',
  })

  const githubConnected = githubData?.githubConnection.connected ?? false

  return (
    <NebulaBackground className="p-6">
      <motion.div
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
      </motion.div>
    </NebulaBackground>
  )
}

function GithubNotConnected() {
  const { t } = useTranslation('releases')
  const navigate = useNavigate()

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
        <Button variant="outline" onClick={() => navigate(ROUTES.SETTINGS)}>
          {t('builder.githubNotConnected.cta')}
        </Button>
      </CardContent>
    </GlassCard>
  )
}
