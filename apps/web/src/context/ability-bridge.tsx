import type { ReactNode } from 'react'
import { useAuth } from './auth.context'
import { AbilityProvider } from './ability.context'

interface AbilityBridgeProps {
  children: ReactNode
}

export function AbilityBridge({ children }: AbilityBridgeProps) {
  const { user } = useAuth()
  return <AbilityProvider role={user?.role ?? null}>{children}</AbilityProvider>
}
