import { Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { useProject } from '@/context/project.context'
import { GITHUB_CONNECTION } from '@/features/settings/graphql/settings.operations'
import { ConnectGithubStage } from '@/features/onboarding/components/ConnectGithubStage'
import { SelectRepoStage } from '@/features/onboarding/components/SelectRepoStage'
import { OnboardingProgress } from '@/features/onboarding/components/OnboardingProgress'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function OnboardingPage() {
  const { t } = useTranslation('onboarding')
  const { projects, loading: projectsLoading } = useProject()
  const { data: githubData, loading: githubLoading } = useQuery(GITHUB_CONNECTION, {
    fetchPolicy: 'cache-and-network',
  })

  const isLoading = projectsLoading || githubLoading

  if (isLoading) {
    return (
      <main className="relative flex min-h-svh flex-col items-center justify-center gap-3 overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,color-mix(in_oklab,var(--brand-indigo-bright)_20%,transparent),transparent_60%)]"
        />
        <ThemeToggle />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </main>
    )
  }

  if (projects.length >= 1) {
    return <Navigate to={ROUTES.WORKSPACE} replace />
  }

  const githubConnected = githubData?.githubConnection.connected ?? false

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--brand-indigo-bright)_22%,transparent),transparent_55%),radial-gradient(circle_at_80%_85%,color-mix(in_oklab,var(--brand-magenta)_16%,transparent),transparent_55%)]"
      />
      <ThemeToggle />
      <div className="relative z-10 flex w-full flex-col items-center gap-8">
        <OnboardingProgress currentStep={githubConnected ? 'selectRepo' : 'connectGithub'} />
        {githubConnected ? <SelectRepoStage /> : <ConnectGithubStage />}
      </div>
    </main>
  )
}
