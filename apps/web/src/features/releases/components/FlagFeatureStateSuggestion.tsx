import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { SET_FEATURE_RELEASE_STATE } from '@/features/features/graphql/features.mutations'
import { featureStateTone } from '@/features/features/constants/feature-enums'
import type { FeatureState } from '@/generated/graphql'

interface FlagFeatureStateSuggestionProps {
  releaseId: string
  featureId: string
  featureName: string
  flagKey: string
  suggestedState: FeatureState
  currentState: FeatureState | null
}

export function FlagFeatureStateSuggestion({
  releaseId,
  featureId,
  featureName,
  flagKey,
  suggestedState,
  currentState,
}: FlagFeatureStateSuggestionProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()

  const [applyState, { loading }] = useMutation(SET_FEATURE_RELEASE_STATE, {
    refetchQueries: ['GetReleaseTree', 'ReleaseFlags'],
    awaitRefetchQueries: true,
  })

  const alreadyApplied = currentState === suggestedState

  async function handleApply() {
    try {
      await applyState({
        variables: { input: { featureId, releaseId, state: suggestedState, flagKey } },
      })
      toast.success(t('flags.suggestion.applied', { feature: featureName }))
    } catch {
      toast.error(t('flags.suggestion.applyError'))
    }
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-[var(--radius-card)] border border-white/10 bg-white/4 px-3 py-2">
      <Sparkles className="size-3.5 shrink-0 text-indigo-400" aria-hidden />
      <span className="text-xs text-muted-foreground">
        {t('flags.suggestion.label', { feature: featureName })}
      </span>
      <StatusBadge tone={featureStateTone(suggestedState)}>
        {enumLabels.featureState(suggestedState)}
      </StatusBadge>

      {alreadyApplied ? (
        <span className="flex items-center gap-1 text-xs text-emerald-300">
          <Check className="size-3.5" aria-hidden />
          {t('flags.suggestion.alreadyApplied')}
        </span>
      ) : (
        <Can I={Action.UPDATE} a={Subject.FEATURE}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-auto h-7 text-xs"
            onClick={handleApply}
            disabled={loading}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            {t('flags.suggestion.apply')}
          </Button>
        </Can>
      )}
    </div>
  )
}
