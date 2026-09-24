import { useState } from 'react'
import type { FlagChangeTarget } from '@/features/flags/types/flag-change-target'

export interface IStageableEnvironment {
  name: string
  enabled: boolean
}

export interface IStageableFlag {
  key: string
  environments: IStageableEnvironment[]
}

export interface IFlagWriteFailure {
  flagKey: string
  environmentName: string
  error: string | null
}

function stageId(flagKey: string, environmentName: string): string {
  return `${flagKey}::${environmentName}`
}

export function useStagedFlagChanges() {
  const [staged, setStaged] = useState<Map<string, FlagChangeTarget>>(new Map())
  const [failures, setFailures] = useState<Map<string, IFlagWriteFailure>>(new Map())

  function toggle(flag: IStageableFlag, environment: IStageableEnvironment) {
    setStaged((current) => {
      const next = new Map(current)
      const id = stageId(flag.key, environment.name)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.set(id, {
          flagKey: flag.key,
          environmentName: environment.name,
          currentEnabled: environment.enabled,
          nextEnabled: !environment.enabled,
        })
      }
      return next
    })
  }

  function stageState(flags: IStageableFlag[], environmentNames: string[], enabled: boolean) {
    setStaged((current) => {
      const next = new Map(current)
      for (const flag of flags) {
        for (const environment of flag.environments) {
          if (!environmentNames.includes(environment.name)) continue
          const id = stageId(flag.key, environment.name)
          if (environment.enabled === enabled) {
            next.delete(id)
            continue
          }
          next.set(id, {
            flagKey: flag.key,
            environmentName: environment.name,
            currentEnabled: environment.enabled,
            nextEnabled: enabled,
          })
        }
      }
      return next
    })
  }

  function clear() {
    setStaged(new Map())
    setFailures(new Map())
  }

  function settle(failed: IFlagWriteFailure[]) {
    const failedIds = new Set(failed.map((failure) => stageId(failure.flagKey, failure.environmentName)))
    setStaged((current) => new Map([...current].filter(([id]) => failedIds.has(id))))
    setFailures(new Map(failed.map((failure) => [stageId(failure.flagKey, failure.environmentName), failure])))
  }

  return {
    targets: [...staged.values()],
    isStaged: (flagKey: string, environmentName: string) => staged.has(stageId(flagKey, environmentName)),
    failureFor: (flagKey: string, environmentName: string) => failures.get(stageId(flagKey, environmentName)) ?? null,
    toggle,
    stageState,
    clear,
    settle,
  }
}
