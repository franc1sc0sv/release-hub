import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import type { BranchCleanupSignalsType } from '@/generated/graphql'
import {
  BRANCH_SIGNAL_ICON,
  BRANCH_SIGNAL_TONE,
  VISIBLE_SIGNAL_KEYS,
} from '../constants/branch-signals'

interface BranchSignalChipsProps {
  signals: BranchCleanupSignalsType
}

export function BranchSignalChips({ signals }: BranchSignalChipsProps) {
  const { t } = useTranslation('repoOps')

  const activeKeys = VISIBLE_SIGNAL_KEYS.filter((key) => signals[key])

  if (activeKeys.length === 0) {
    return <span className="text-sm text-muted-foreground">{t('table.signals.none')}</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeKeys.map((key) => (
        <StatusBadge key={key} tone={BRANCH_SIGNAL_TONE[key]} icon={BRANCH_SIGNAL_ICON[key]}>
          {t(`table.signals.${key}`)}
        </StatusBadge>
      ))}
    </div>
  )
}
