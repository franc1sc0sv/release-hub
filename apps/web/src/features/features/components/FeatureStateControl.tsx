import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { SET_FEATURE_STATE } from '../graphql/features.mutations'
import {
  FEATURE_STATE_OPTIONS,
  FEATURE_STATE_TEXT_CLASS,
  FEATURE_STATE_BADGE_CLASS,
} from '../constants/feature-enums'
import type { FeatureState } from '@/generated/graphql'

interface FeatureStateControlProps {
  featureId: string
  currentState: FeatureState
}

function StateSelectInner({ featureId, currentState }: FeatureStateControlProps) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()
  const [optimisticState, setOptimisticState] = useState<FeatureState>(currentState)

  const [setFeatureState] = useMutation(SET_FEATURE_STATE)

  async function handleChange(value: string | null) {
    if (!value) return
    const newState = value as FeatureState
    const previousState = optimisticState

    setOptimisticState(newState)

    try {
      await setFeatureState({ variables: { input: { featureId, state: newState } } })
      toast.success(t('toast.stateChanged'))
    } catch {
      setOptimisticState(previousState)
      toast.error(t('toast.stateError'))
    }
  }

  return (
    <Select value={optimisticState} onValueChange={handleChange}>
      <SelectTrigger
        className={`h-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm focus-visible:ring-ring ${FEATURE_STATE_TEXT_CLASS[optimisticState]}`}
        aria-label={t('state.label')}
      >
        <SelectValue>
          {(value: string) => (value ? enumLabels.featureState(value as FeatureState) : null)}
        </SelectValue>
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
  )
}

function ReadOnlyStateBadge({ state }: { state: FeatureState }) {
  const enumLabels = useEnumLabels()
  return (
    <Badge variant="outline" className={`rounded-full border ${FEATURE_STATE_BADGE_CLASS[state]}`}>
      {enumLabels.featureState(state)}
    </Badge>
  )
}

export function FeatureStateControl(props: FeatureStateControlProps) {
  return (
    <Can I={Action.UPDATE} a={Subject.FEATURE} passThrough>
      {(allowed) =>
        allowed ? <StateSelectInner {...props} /> : <ReadOnlyStateBadge state={props.currentState} />
      }
    </Can>
  )
}
