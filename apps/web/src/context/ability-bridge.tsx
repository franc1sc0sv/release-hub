import type { ReactNode } from 'react'
import { AbilityProvider } from './ability.context'

interface AbilityBridgeProps {
  children: ReactNode
}

export function AbilityBridge({ children }: AbilityBridgeProps) {
  return <AbilityProvider>{children}</AbilityProvider>
}
