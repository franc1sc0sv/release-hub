import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { ROUTES } from '@/lib/routes'
import { useProject } from '@/context/project.context'
import { GITHUB_CONNECTION } from '@/features/settings/graphql/settings.operations'

interface OnboardingGateProps {
  children: ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { projects, loading: projectsLoading } = useProject()
  const { data: githubData, loading: githubLoading } = useQuery(GITHUB_CONNECTION, {
    fetchPolicy: 'cache-and-network',
  })

  if (projectsLoading || githubLoading) {
    return <>{children}</>
  }

  const githubConnected = githubData?.githubConnection.connected ?? false

  if (!githubConnected || projects.length === 0) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return <>{children}</>
}
