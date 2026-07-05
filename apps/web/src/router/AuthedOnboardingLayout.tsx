import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/auth.context'
import { ROUTES } from '@/lib/routes'
import { OrganizationProvider } from '@/context/organization.context'

export function AuthedOnboardingLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return (
    <OrganizationProvider>
      <Outlet />
    </OrganizationProvider>
  )
}
