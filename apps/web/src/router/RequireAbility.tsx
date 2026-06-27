import { Navigate, Outlet } from 'react-router-dom'
import { useAbility } from '@/context/ability.context'
import { ROUTES } from '@/lib/routes'
import type { Action, Subject } from '@release-hub/shared'

interface RequireAbilityProps {
  action: Action
  subject: Subject
}

export function RequireAbility({ action, subject }: RequireAbilityProps) {
  const ability = useAbility()

  if (!ability.can(action, subject)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
