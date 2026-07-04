import { useTranslation } from 'react-i18next'
import { GitPullRequestArrow } from 'lucide-react'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { BranchCleanupPageSignalsType } from '@/generated/graphql'
import {
  BRANCH_SIGNAL_ICON,
  BRANCH_SIGNAL_TONE,
  VISIBLE_SIGNAL_KEYS,
} from '../constants/branch-signals'

interface BranchSignalChipsProps {
  signals: BranchCleanupPageSignalsType
  openPullRequestNumber?: number | null
  openPullRequestUrl?: string | null
}

export function BranchSignalChips({
  signals,
  openPullRequestNumber,
  openPullRequestUrl,
}: BranchSignalChipsProps) {
  const { t } = useTranslation('repoOps')

  const activeKeys = VISIBLE_SIGNAL_KEYS.filter((key) => signals[key])
  const hasOpenPr = openPullRequestNumber != null

  if (activeKeys.length === 0 && !hasOpenPr) {
    return <span className="text-sm text-muted-foreground">{t('table.signals.none')}</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {hasOpenPr && (
        <Tooltip>
          <TooltipTrigger>
            {openPullRequestUrl ? (
              <a
                href={openPullRequestUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
                aria-label={t('table.signals.openPrAria', { number: openPullRequestNumber })}
              >
                <StatusBadge tone={StatusBadgeTone.INDIGO} icon={GitPullRequestArrow}>
                  {t('table.signals.openPr', { number: openPullRequestNumber })}
                </StatusBadge>
              </a>
            ) : (
              <StatusBadge tone={StatusBadgeTone.INDIGO} icon={GitPullRequestArrow}>
                {t('table.signals.openPr', { number: openPullRequestNumber })}
              </StatusBadge>
            )}
          </TooltipTrigger>
          <TooltipContent>{t('table.signalTooltips.openPr')}</TooltipContent>
        </Tooltip>
      )}
      {activeKeys.map((key) => (
        <Tooltip key={key}>
          <TooltipTrigger>
            <StatusBadge tone={BRANCH_SIGNAL_TONE[key]} icon={BRANCH_SIGNAL_ICON[key]}>
              {t(`table.signals.${key}`)}
            </StatusBadge>
          </TooltipTrigger>
          <TooltipContent>{t(`table.signalTooltips.${key}`)}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
