import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth.context'
import { AppShell } from '@/components/shell/AppShell'
import { ROUTES } from '@/lib/routes'

export function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  return <AppShell />
}
