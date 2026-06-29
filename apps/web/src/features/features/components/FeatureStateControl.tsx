import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { SET_FEATURE_STATE } from '../graphql/features.mutations'
import { GET_RELEASE_TREE } from '@/features/releases/graphql/releases.queries'
import { FEATURE_STATE_OPTIONS, FEATURE_STATE_TEXT_CLASS } from '../constants/feature-enums'
import { ClientAvailabilityLine } from './ClientAvailabilityLine'
import type { FeatureState } from '@/generated/graphql'

interface FeatureStateControlProps {
  featureId: string
  releaseId: string
  currentState: FeatureState
  clientAvailabilityKey: string
}

function StateSelectInner({
  featureId,
  releaseId,
  currentState,
  clientAvailabilityKey,
}: FeatureStateControlProps) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const [optimisticState, setOptimisticState] = useState<FeatureState>(currentState)
  const [optimisticKey, setOptimisticKey] = useState<string>(clientAvailabilityKey)

  const [setFeatureState] = useMutation(SET_FEATURE_STATE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
    awaitRefetchQueries: false,
  })

  async function handleChange(value: string | null) {
    if (!value) return
    const newState = value as FeatureState
    const previousState = optimisticState
    const previousKey = optimisticKey

    setOptimisticState(newState)

    try {
      const result = await setFeatureState({
        variables: { input: { featureId, releaseId, state: newState } },
      })
      const returnedKey = result.data?.setFeatureState.clientAvailabilityKey
      if (returnedKey) {
        setOptimisticKey(returnedKey)
      }
      toast.success(t('toast.stateChanged'))
    } catch {
      setOptimisticState(previousState)
      setOptimisticKey(previousKey)
      toast.error(t('toast.stateError'))
    }
  }

  const colorClass = FEATURE_STATE_TEXT_CLASS[optimisticState]

  return (
    <div className="flex flex-col gap-1">
      <Select value={optimisticState} onValueChange={handleChange}>
        <SelectTrigger
          className={`h-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm focus-visible:ring-ring ${colorClass}`}
          aria-label={t('state.label')}
        >
          <SelectValue>{(value: string) => value ? enumLabels.featureState(value as FeatureState) : null}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-[var(--radius-card)] border border-white/15 bg-popover/95 backdrop-blur-xl">
          {FEATURE_STATE_OPTIONS.map((state) => (
            <SelectItem
              key={state}
              value={state}
              className={`rounded-xl text-xs ${FEATURE_STATE_TEXT_CLASS[state]}`}
            >
              {enumLabels.featureState(state)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ClientAvailabilityLine clientAvailabilityKey={optimisticKey} />
    </div>
  )
}

export function FeatureStateControl(props: FeatureStateControlProps) {
  return (
    <Can I={Action.UPDATE} a={Subject.FEATURE}>
      <StateSelectInner {...props} />
    </Can>
  )
}
