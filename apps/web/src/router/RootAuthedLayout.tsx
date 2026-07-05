import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/auth.context'
import { ROUTES } from '@/lib/routes'
import { OrganizationProvider } from '@/context/organization.context'
import { OrgAbilitySync } from '@/context/org-ability-sync'
import { OnboardingGate } from '@/router/OnboardingGate'

export function RootAuthedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return (
    <OrganizationProvider>
      <OrgAbilitySync>
        <OnboardingGate>
          <Outlet />
        </OnboardingGate>
      </OrgAbilitySync>
    </OrganizationProvider>
  )
}
