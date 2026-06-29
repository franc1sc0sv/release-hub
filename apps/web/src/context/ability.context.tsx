import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { createContextualCan } from '@casl/react'
import { createMongoAbility } from '@casl/ability'
import { type AppAbility, type Action, type Subject } from '@release-hub/shared'

const emptyAbility: AppAbility = createMongoAbility<[Action, Subject]>([])

export const AbilityValueContext = createContext<AppAbility>(emptyAbility)
const AbilitySetterContext = createContext<(ability: AppAbility) => void>(() => undefined)
const AbilityReadyContext = createContext<boolean>(false)

export const Can = createContextualCan(AbilityValueContext.Consumer)

interface AbilityProviderProps {
  children: ReactNode
}

export function AbilityProvider({ children }: AbilityProviderProps) {
  const [ability, setAbilityState] = useState<AppAbility>(emptyAbility)
  const [ready, setReady] = useState(false)

  const setAbility = useCallback((next: AppAbility) => {
    setAbilityState(next)
    setReady(true)
  }, [])

  return (
    <AbilitySetterContext.Provider value={setAbility}>
      <AbilityReadyContext.Provider value={ready}>
        <AbilityValueContext.Provider value={ability}>
          {children}
        </AbilityValueContext.Provider>
      </AbilityReadyContext.Provider>
    </AbilitySetterContext.Provider>
  )
}

export function useAbility(): AppAbility {
  return useContext(AbilityValueContext)
}

export function useAbilityReady(): boolean {
  return useContext(AbilityReadyContext)
}

export function useSetAbility(): (ability: AppAbility) => void {
  return useContext(AbilitySetterContext)
}
