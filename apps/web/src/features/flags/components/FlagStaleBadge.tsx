import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000

interface FlagStaleBadgeProps {
  createdAt: string | null | undefined
}

export function FlagStaleBadge({ createdAt }: FlagStaleBadgeProps) {
  const { t } = useTranslation('flags')

  if (!createdAt) return null

  const isStale = Date.now() - new Date(createdAt).getTime() > SIXTY_DAYS_MS
  if (!isStale) return null

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant="outline"
          className="rounded-full border-amber-500/40 bg-amber-500/10 font-medium text-amber-400"
        >
          {t('stale.badge')}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('stale.tooltip')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
