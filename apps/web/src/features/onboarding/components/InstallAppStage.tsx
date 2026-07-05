import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Github, Building2, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrganization } from '@/context/organization.context'
import { useGithubConnection } from '@/features/settings/hooks/use-github-connection'

export function InstallAppStage() {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()
  const { activeOrg } = useOrganization()
  const { installViaApp, loading } = useGithubConnection()

  const orgName = activeOrg?.name ?? ''

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
          <CardTitle className="font-display text-display-md">{t('installApp.title')}</CardTitle>
          <CardDescription className="text-balance">
            {t('installApp.description')}
          </CardDescription>
          <div className="mt-3 flex justify-center">
            <Badge variant="secondary" className="gap-1.5">
              <Building2 className="size-3" aria-hidden="true" />
              {orgName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <GradientButton
            className="w-full"
            onClick={() => activeOrg && void installViaApp({ organizationId: activeOrg.id })}
            disabled={loading || !activeOrg}
            aria-label={t('installApp.installButton', { org: orgName })}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Github className="size-4" aria-hidden="true" />
            )}
            {t('installApp.installButton', { org: orgName })}
          </GradientButton>
          <p className="text-center text-xs text-muted-foreground">{t('installApp.hint')}</p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/')}
          >
            {t('installApp.skip')}
          </Button>
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}
