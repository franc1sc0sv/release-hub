import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAbility, useAbilityReady } from '@/context/ability.context'
import { ROUTES } from '@/lib/routes'
import type { Action, Subject } from '@release-hub/shared'

interface RequireAbilityProps {
  action: Action
  subject: Subject
}

export function RequireAbility({ action, subject }: RequireAbilityProps) {
  const ability = useAbility()
  const ready = useAbilityReady()

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ability.can(action, subject)) {
    return <Navigate to={ROUTES.WORKSPACE} replace />
  }

  return <Outlet />
}
