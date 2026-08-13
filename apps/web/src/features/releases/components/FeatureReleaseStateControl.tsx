import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { SET_FEATURE_RELEASE_STATE } from '@/features/features/graphql/features.mutations'
import {
  FEATURE_STATE_OPTIONS,
  FEATURE_STATE_TEXT_CLASS,
  FeatureKindValue,
  featureStateTone,
} from '@/features/features/constants/feature-enums'
import type { FeatureKind, FeatureState } from '@/generated/graphql'

interface FeatureReleaseStateControlProps {
  featureId: string
  releaseId: string
  state: FeatureState
  kind: FeatureKind
}

function ReleaseStateSelect({ featureId, releaseId, state }: FeatureReleaseStateControlProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [optimisticState, setOptimisticState] = useState<FeatureState>(state)

  const [setFeatureReleaseState] = useMutation(SET_FEATURE_RELEASE_STATE, {
    refetchQueries: ['GetReleaseTree'],
    awaitRefetchQueries: true,
  })

  async function handleChange(value: string | null) {
    if (!value) return
    const nextState = value as FeatureState
    const previousState = optimisticState

    setOptimisticState(nextState)

    try {
      await setFeatureReleaseState({
        variables: { input: { featureId, releaseId, state: nextState, flagKey: null } },
      })
      toast.success(t('view.feature.stateChanged'))
    } catch {
      setOptimisticState(previousState)
      toast.error(t('view.feature.stateError'))
    }
  }

  return (
    <Select value={optimisticState} onValueChange={handleChange}>
      <SelectTrigger
        className={`h-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium focus-visible:ring-ring ${FEATURE_STATE_TEXT_CLASS[optimisticState]}`}
        aria-label={t('view.feature.stateLabel')}
      >
        <SelectValue>
          {(value: string) => (value ? enumLabels.featureState(value as FeatureState) : null)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-[var(--radius-card)] border border-white/15 bg-popover">
        {FEATURE_STATE_OPTIONS.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className={`rounded-xl text-xs ${FEATURE_STATE_TEXT_CLASS[option]}`}
          >
            {enumLabels.featureState(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ReadOnlyState({ state }: { state: FeatureState }) {
  const enumLabels = useEnumLabels()
  return <StatusBadge tone={featureStateTone(state)}>{enumLabels.featureState(state)}</StatusBadge>
}

export function FeatureReleaseStateControl(props: FeatureReleaseStateControlProps) {
  if (props.kind === FeatureKindValue.DEFAULT) {
    return null
  }

  return (
    <Can I={Action.UPDATE} a={Subject.FEATURE} passThrough>
      {(allowed) =>
        allowed ? <ReleaseStateSelect {...props} /> : <ReadOnlyState state={props.state} />
      }
    </Can>
  )
}
