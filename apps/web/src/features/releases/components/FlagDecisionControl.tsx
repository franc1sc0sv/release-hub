import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { CLEAR_RELEASE_FLAG_DECISION, SET_RELEASE_FLAG_DECISION } from '../graphql/releases.mutations'
import { RELEASE_FLAG_DECISION_OPTIONS, releaseFlagDecisionTone } from '../constants/release-enums'
import type { ReleaseFlagDecisionType } from '@/generated/graphql'

const DECISION_REFETCH_QUERIES = ['ReleaseFlags', 'CarriedOverFlags', 'GetFlagDetail', 'GetFlagHistory']

interface FlagDecisionControlProps {
  releaseId: string
  trackedFlagId: string
  flagKey: string
  decision: ReleaseFlagDecisionType | null
  canDecide: boolean
  onDecided?: (decision: ReleaseFlagDecisionType) => void
}

export function FlagDecisionControl({
  releaseId,
  trackedFlagId,
  flagKey,
  decision,
  canDecide,
  onDecided,
}: FlagDecisionControlProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [optimisticDecision, setOptimisticDecision] = useState<ReleaseFlagDecisionType | null>(decision)
  const [setReleaseFlagDecision, { loading }] = useMutation(SET_RELEASE_FLAG_DECISION, {
    refetchQueries: DECISION_REFETCH_QUERIES,
  })
  const [clearReleaseFlagDecision, { loading: clearing }] = useMutation(CLEAR_RELEASE_FLAG_DECISION, {
    refetchQueries: DECISION_REFETCH_QUERIES,
  })

  if (!canDecide) {
    return decision ? (
      <StatusBadge tone={releaseFlagDecisionTone(decision)}>
        {enumLabels.releaseFlagDecision(decision)}
      </StatusBadge>
    ) : (
      <span className="text-xs text-muted-foreground">{t('flags.noDecision')}</span>
    )
  }

  async function handleChange(next: ReleaseFlagDecisionType) {
    const previous = optimisticDecision
    setOptimisticDecision(next)
    try {
      await setReleaseFlagDecision({
        variables: { input: { releaseId, trackedFlagId, decision: next } },
      })
      onDecided?.(next)
      toast.success(t('flags.toast.decisionSaved'))
    } catch (error) {
      setOptimisticDecision(previous)
      toast.error(error instanceof Error && error.message ? error.message : t('flags.toast.decisionError'))
    }
  }

  async function handleClear() {
    const previous = optimisticDecision
    setOptimisticDecision(null)
    try {
      await clearReleaseFlagDecision({ variables: { input: { releaseId, trackedFlagId } } })
      toast.success(t('flags.toast.decisionCleared'))
    } catch (error) {
      setOptimisticDecision(previous)
      toast.error(error instanceof Error && error.message ? error.message : t('flags.toast.clearError'))
    }
  }

  const busy = loading || clearing

  return (
    <div className="flex items-center gap-1">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={optimisticDecision ? [optimisticDecision] : []}
        onValueChange={(groupValue) => {
          const next = RELEASE_FLAG_DECISION_OPTIONS.find((option) => groupValue.includes(option))
          if (next && next !== optimisticDecision) void handleChange(next)
        }}
        disabled={busy}
        aria-label={t('flags.decisionAriaLabel', { flag: flagKey })}
      >
        {RELEASE_FLAG_DECISION_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="px-2.5 text-xs text-muted-foreground data-[pressed]:bg-brand-indigo-bright/20 data-[pressed]:text-foreground"
          >
            {t(`flags.decisionShort.${option}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {optimisticDecision && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void handleClear()}
                disabled={busy}
                aria-label={t('flags.clearDecisionAriaLabel', { flag: flagKey })}
                className="text-muted-foreground hover:text-foreground"
              />
            }
          >
            <Undo2 className="size-3.5" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>{t('flags.clearDecision')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
