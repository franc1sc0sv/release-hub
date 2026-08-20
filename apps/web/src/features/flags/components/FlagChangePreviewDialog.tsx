import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EnvStateCell } from './EnvStateCell'
import { FlagWriteResultList } from './FlagWriteResultList'
import type { FlagChangeTarget } from '../types/flag-change-target'
import type { FlagWriteReport } from '../hooks/use-flag-write-actions'

interface FlagChangePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targets: FlagChangeTarget[]
  pending: boolean
  report: FlagWriteReport | null
  onConfirm: (targets: FlagChangeTarget[]) => void
  onClose: () => void
}

function targetId(target: FlagChangeTarget): string {
  return `${target.flagKey}:${target.environmentName}`
}

export function FlagChangePreviewDialog({
  open,
  onOpenChange,
  targets,
  pending,
  report,
  onConfirm,
  onClose,
}: FlagChangePreviewDialogProps) {
  const { t } = useTranslation('flags')
  const [excluded, setExcluded] = useState<string[]>([])

  useEffect(() => {
    if (open) setExcluded([])
  }, [open])

  const selected = targets.filter((target) => !excluded.includes(targetId(target)))

  function toggle(target: FlagChangeTarget) {
    const id = targetId(target)
    setExcluded((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    )
  }

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('write.preview.title')}</DialogTitle>
          <DialogDescription>{t('write.preview.description')}</DialogDescription>
        </DialogHeader>

        {report ? (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <FlagWriteResultList report={report} />
            </div>
            <DialogFooter>
              <Button onClick={onClose}>{t('write.close')}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              {targets.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t('write.preview.empty')}
                </p>
              ) : (
                <ul className="space-y-2 pr-1">
                  {targets.map((target) => {
                    const id = targetId(target)
                    const isSelected = !excluded.includes(id)
                    return (
                      <li
                        key={id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggle(target)}
                          className="shrink-0"
                          aria-label={t('write.preview.rowLabel', {
                            flag: target.flagKey,
                            environment: target.environmentName,
                          })}
                        />
                        <span
                          className="min-w-0 flex-1 basis-48 truncate font-mono text-sm text-foreground"
                          title={target.flagKey}
                        >
                          {target.flagKey}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {target.environmentName}
                          </span>
                          <EnvStateCell
                            enabled={target.currentEnabled}
                            onLabel={t('state.on')}
                            offLabel={t('state.off')}
                          />
                          <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                          <EnvStateCell
                            enabled={target.nextEnabled}
                            onLabel={t('state.on')}
                            offLabel={t('state.off')}
                          />
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t('write.preview.selected', { count: selected.length, total: targets.length })}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} disabled={pending}>
                  {t('write.cancel')}
                </Button>
                <Button
                  onClick={() => onConfirm(selected)}
                  disabled={pending || selected.length === 0}
                  className="gap-2"
                >
                  {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {t('write.preview.confirm')}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
