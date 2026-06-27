import { createContext, useContext, type ReactNode, useMemo } from 'react'
import { createContextualCan } from '@casl/react'
import { createMongoAbility } from '@casl/ability'
import { defineAbilityFor, type AppAbility, type UserRole, type Action, type Subject } from '@release-hub/shared'

const emptyAbility: AppAbility = createMongoAbility<[Action, Subject]>([])
const AbilityContext = createContext<AppAbility>(emptyAbility)

export const Can = createContextualCan(AbilityContext.Consumer)

interface AbilityProviderProps {
  role: UserRole | null
  children: ReactNode
}

export function AbilityProvider({ role, children }: AbilityProviderProps) {
  const ability = useMemo(
    () => (role ? defineAbilityFor(role) : emptyAbility),
    [role],
  )
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

export function useAbility(): AppAbility {
  return useContext(AbilityContext)
}
