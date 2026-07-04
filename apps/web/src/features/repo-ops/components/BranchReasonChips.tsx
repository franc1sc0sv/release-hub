import { useTranslation } from 'react-i18next'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import type { BranchBlockReason } from '@/generated/graphql'

interface BranchReasonChipsProps {
  blockReasons: BranchBlockReason[]
}

export function BranchReasonChips({ blockReasons }: BranchReasonChipsProps) {
  const { t } = useTranslation('repoOps')
  const enumLabels = useEnumLabels()

  if (blockReasons.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {blockReasons.map((reason) => (
        <Tooltip key={reason}>
          <TooltipTrigger>
            <StatusBadge tone={StatusBadgeTone.INDIGO}>{enumLabels.branchBlockReason(reason)}</StatusBadge>
          </TooltipTrigger>
          <TooltipContent>{t(`protected.reasonDescription.${reason}`)}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
