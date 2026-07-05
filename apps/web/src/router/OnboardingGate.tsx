import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { useOrganization } from '@/context/organization.context'

interface OnboardingGateProps {
  children: ReactNode
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { organizations, loading } = useOrganization()

  if (loading && organizations.length === 0) {
    return <>{children}</>
  }

  const onboardingComplete = organizations.length >= 1

  if (!onboardingComplete) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return <>{children}</>
}
