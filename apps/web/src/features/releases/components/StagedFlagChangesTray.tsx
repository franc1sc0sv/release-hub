import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { GradientButton } from '@/components/nebula/GradientButton'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { isProductionEnvironment } from '../constants/release-environments'
import type { FlagChangeTarget } from '@/features/flags/types/flag-change-target'

interface StagedFlagChangesTrayProps {
  targets: FlagChangeTarget[]
  pending: boolean
  onDiscard: () => void
  onApply: () => void
}

export function StagedFlagChangesTray({ targets, pending, onDiscard, onApply }: StagedFlagChangesTrayProps) {
  const { t } = useTranslation('releases')
  const [productionConfirmed, setProductionConfirmed] = useState(false)
  const touchesProduction = targets.some((target) => isProductionEnvironment(target.environmentName))
  const canApply = !pending && (!touchesProduction || productionConfirmed)

  return (
    <div
      role="region"
      aria-label={t('workspace.flags.tray.label')}
      className="sticky bottom-4 z-10 space-y-3 rounded-[var(--radius-card)] border border-brand-indigo-bright/45 bg-popover px-4 py-3 shadow-2xl"
    >
      <div className="flex items-start gap-3">
        <StatusBadge tone={StatusBadgeTone.INDIGO}>
          {t('workspace.flags.tray.count', { count: targets.length })}
        </StatusBadge>
        <ul className="flex min-w-0 flex-1 flex-col gap-1 font-mono text-xs text-muted-foreground">
          {targets.map((target) => (
            <li key={`${target.flagKey}::${target.environmentName}`} className="flex items-center gap-1">
              <span className="min-w-0 truncate text-foreground/80">{target.flagKey}</span>
              <span>@ {target.environmentName}</span>
              <ArrowRight className="size-3" aria-hidden />
              <span className={target.nextEnabled ? 'text-emerald-300' : 'text-foreground/70'}>
                {target.nextEnabled ? t('workspace.flags.tray.on') : t('workspace.flags.tray.off')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {touchesProduction && (
          <Label className="mr-auto flex cursor-pointer items-center gap-2 text-xs font-normal text-amber-300">
            <Checkbox
              checked={productionConfirmed}
              onCheckedChange={(checked) => setProductionConfirmed(checked === true)}
            />
            {t('workspace.flags.tray.confirmProduction')}
          </Label>
        )}
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={pending}>
          {t('workspace.flags.tray.discard')}
        </Button>
        <GradientButton size="sm" onClick={onApply} disabled={!canApply} className="gap-2">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {t('workspace.flags.tray.apply', { count: targets.length })}
        </GradientButton>
      </div>
    </div>
  )
}
