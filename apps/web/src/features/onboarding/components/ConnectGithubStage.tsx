import { useTranslation } from 'react-i18next'
import { Github, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGithubConnection } from '@/features/settings/hooks/use-github-connection'

export function ConnectGithubStage() {
  const { t } = useTranslation('onboarding')
  const { connect, loading } = useGithubConnection()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <GlassCard glow="indigo">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Github className="size-7 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-display">
            {t('connectGithub.title')}
          </CardTitle>
          <CardDescription className="text-balance">
            {t('connectGithub.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <GradientButton
            className="w-full"
            onClick={() => void connect()}
            disabled={loading}
            aria-label={t('connectGithub.button')}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Github className="size-4" aria-hidden="true" />
            )}
            {t('connectGithub.button')}
          </GradientButton>
          <p className="text-center text-xs text-muted-foreground">
            {t('connectGithub.note')}
          </p>
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}
