import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth.context'
import { AppShell } from '@/components/shell/AppShell'
import { ROUTES } from '@/lib/routes'
import { ProjectProvider } from '@/context/project.context'
import { ProjectAbilitySync } from '@/context/project-ability-sync'
import { OnboardingGate } from '@/router/OnboardingGate'

export function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return (
    <ProjectProvider>
      <ProjectAbilitySync>
        <OnboardingGate>
          <AppShell />
        </OnboardingGate>
      </ProjectAbilitySync>
    </ProjectProvider>
  )
}
