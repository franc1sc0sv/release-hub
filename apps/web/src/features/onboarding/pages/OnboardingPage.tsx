import { Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { useProject } from '@/context/project.context'
import { GITHUB_CONNECTION } from '@/features/settings/graphql/settings.operations'
import { ConnectGithubStage } from '@/features/onboarding/components/ConnectGithubStage'
import { SelectRepoStage } from '@/features/onboarding/components/SelectRepoStage'
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
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background">
        <ThemeToggle />
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </main>
    )
  }

  if (projects.length >= 1) {
    return <Navigate to={ROUTES.WORKSPACE} replace />
  }

  const githubConnected = githubData?.githubConnection.connected ?? false

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
      <ThemeToggle />
      {githubConnected ? <SelectRepoStage /> : <ConnectGithubStage />}
    </main>
  )
}
