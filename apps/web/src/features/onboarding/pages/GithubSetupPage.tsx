import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, useLocation, generatePath } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Github, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '@/context/auth.context'
import { ACTIVE_ORG_STORAGE_KEY } from '@/context/organization.context'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard } from '@/components/nebula/GlassCard'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ROUTES } from '@/lib/routes'
import { COMPLETE_GITHUB_INSTALLATION } from '@/features/settings/graphql/settings.operations'
import { slideUp, easeSoft } from '@/lib/animations'

type MutationState = 'processing' | 'success' | 'error'

function SetupShell({
  glow,
  icon,
  heading,
  description,
  children,
}: {
  glow: 'indigo' | 'magenta'
  icon: React.ReactNode
  heading: string
  description: string
  children?: React.ReactNode
}) {
  const { t } = useTranslation('githubSetup')

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--brand-indigo-bright)_22%,transparent),transparent_60%)]"
      />
      <ThemeToggle />
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, ease: easeSoft }}
        className="relative z-10 w-full max-w-sm"
      >
        <GlassCard glow={glow}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {icon}
            </div>
            <CardTitle className="font-display text-display-md">{t('title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">{heading}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </CardContent>
        </GlassCard>
      </motion.div>
    </main>
  )
}

export default function GithubSetupPage() {
  const { t } = useTranslation('githubSetup')
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const installationId = searchParams.get('installation_id')
  const setupAction = searchParams.get('setup_action')
  const state = searchParams.get('state')

  const [mutationState, setMutationState] = useState<MutationState>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [installedOrganizationId, setInstalledOrganizationId] = useState<string | null>(null)
  const hasFiredRef = useRef(false)

  const [completeGithubInstallation] = useMutation(COMPLETE_GITHUB_INSTALLATION, {
    onCompleted(data) {
      localStorage.setItem(
        ACTIVE_ORG_STORAGE_KEY,
        data.completeGithubInstallation.organizationId,
      )
      setInstalledOrganizationId(data.completeGithubInstallation.organizationId)
      setMutationState('success')
    },
    onError(error) {
      setErrorMessage(error.message)
      setMutationState('error')
    },
  })

  const isPending = setupAction === 'request'
  const isInvalid = !isPending && (!installationId || !state)

  useEffect(() => {
    if (isPending || isInvalid || !user || !installationId || !state) return
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    completeGithubInstallation({ variables: { input: { installationId, state } } })
  }, [isPending, isInvalid, user, installationId, state, completeGithubInstallation])

  if (isPending) {
    return (
      <SetupShell
        glow="indigo"
        icon={<Clock className="size-5" aria-hidden="true" />}
        heading={t('pending.heading')}
        description={t('pending.description')}
      >
        <Button className="w-full" onClick={() => navigate('/')}>
          {t('pending.workspace')}
        </Button>
      </SetupShell>
    )
  }

  if (isInvalid) {
    return (
      <SetupShell
        glow="indigo"
        icon={<XCircle className="size-5" aria-hidden="true" />}
        heading={t('invalid.heading')}
        description={t('invalid.description')}
      >
        <Button className="w-full" onClick={() => navigate('/')}>
          {t('invalid.workspace')}
        </Button>
      </SetupShell>
    )
  }

  if (!user) {
    return (
      <SetupShell
        glow="indigo"
        icon={<Github className="size-5" aria-hidden="true" />}
        heading={t('signIn.heading')}
        description={t('signIn.description')}
      >
        <Button
          className="w-full"
          onClick={() =>
            navigate(
              `${ROUTES.LOGIN}?returnTo=${encodeURIComponent(location.pathname + location.search)}`,
            )
          }
        >
          {t('signIn.cta')}
        </Button>
      </SetupShell>
    )
  }

  if (mutationState === 'processing') {
    return (
      <SetupShell
        glow="indigo"
        icon={<Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        heading={t('processing.heading')}
        description={t('processing.description')}
      />
    )
  }

  if (mutationState === 'success') {
    return (
      <SetupShell
        glow="magenta"
        icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
        heading={t('success.heading')}
        description={t('success.description')}
      >
        <div className="flex w-full flex-col gap-2">
          <Button
            className="w-full"
            onClick={() =>
              installedOrganizationId &&
              navigate(
                generatePath(ROUTES.ORG_INTEGRATION, {
                  organizationId: installedOrganizationId,
                  integration: 'github',
                }),
              )
            }
          >
            {t('success.ctaSettings')}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            {t('success.ctaWorkspace')}
          </Button>
        </div>
      </SetupShell>
    )
  }

  return (
    <SetupShell
      glow="indigo"
      icon={<XCircle className="size-5" aria-hidden="true" />}
      heading={t('error.heading')}
      description={errorMessage ?? t('error.description')}
    >
      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" onClick={() => navigate(ROUTES.ONBOARDING)}>
          {t('error.retry')}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
        >
          {t('error.workspace')}
        </Button>
      </div>
    </SetupShell>
  )
}
