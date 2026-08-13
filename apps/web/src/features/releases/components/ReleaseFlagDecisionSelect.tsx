import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ChevronDownIcon } from 'lucide-react'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SET_RELEASE_FLAG_DECISION } from '../graphql/releases.mutations'
import { RELEASE_FLAG_DECISION_OPTIONS } from '../constants/release-enums'
import type { ReleaseFlagDecisionType } from '@/generated/graphql'

interface ReleaseFlagDecisionSelectProps {
  releaseId: string
  trackedFlagId: string
  decision: ReleaseFlagDecisionType | null
  refetchQueries?: string[]
}

export function ReleaseFlagDecisionSelect({
  releaseId,
  trackedFlagId,
  decision,
  refetchQueries = ['CarriedOverFlags'],
}: ReleaseFlagDecisionSelectProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [optimisticDecision, setOptimisticDecision] = useState<ReleaseFlagDecisionType | null>(
    decision,
  )

  const [setReleaseFlagDecision] = useMutation(SET_RELEASE_FLAG_DECISION, { refetchQueries })

  async function handleChange(newDecision: ReleaseFlagDecisionType) {
    const previousDecision = optimisticDecision

    setOptimisticDecision(newDecision)

    try {
      await setReleaseFlagDecision({
        variables: { input: { releaseId, trackedFlagId, decision: newDecision } },
      })
      toast.success(t('flags.toast.decisionSaved'))
    } catch {
      setOptimisticDecision(previousDecision)
      toast.error(t('flags.toast.decisionError'))
    }
  }

  return (
    <div className="flex items-center gap-2">
      {optimisticDecision ? (
        <Badge variant="outline" className="rounded-full">
          {enumLabels.releaseFlagDecision(optimisticDecision)}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">{t('flags.decisionPlaceholder')}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full border border-white/15 bg-white/5 p-0 focus-visible:ring-ring"
              aria-label={t('flags.decisionLabel')}
            />
          }
        >
          <ChevronDownIcon className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {RELEASE_FLAG_DECISION_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option}
              className="text-xs"
              onClick={() => void handleChange(option)}
            >
              {enumLabels.releaseFlagDecision(option)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
