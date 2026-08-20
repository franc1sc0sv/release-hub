import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, TriangleAlert } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FlagWriteResultList } from './FlagWriteResultList'
import type { FlagDeleteTarget } from '../types/flag-change-target'
import type { FlagWriteReport } from '../hooks/use-flag-write-actions'

interface FlagDeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targets: FlagDeleteTarget[]
  pending: boolean
  report: FlagWriteReport | null
  onConfirm: (flagKeys: string[]) => void
  onClose: () => void
}

export function FlagDeleteConfirmDialog({
  open,
  onOpenChange,
  targets,
  pending,
  report,
  onConfirm,
  onClose,
}: FlagDeleteConfirmDialogProps) {
  const { t } = useTranslation('flags')
  const [excluded, setExcluded] = useState<string[]>([])

  useEffect(() => {
    if (open) setExcluded([])
  }, [open])

  const selected = targets.filter((target) => !excluded.includes(target.flagKey))

  function toggle(flagKey: string) {
    setExcluded((current) =>
      current.includes(flagKey) ? current.filter((entry) => entry !== flagKey) : [...current, flagKey],
    )
  }

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('write.delete.title')}</DialogTitle>
          <DialogDescription>{t('write.delete.description')}</DialogDescription>
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
            <Alert variant="destructive">
              <TriangleAlert className="size-4" aria-hidden />
              <AlertDescription>{t('write.delete.warning')}</AlertDescription>
            </Alert>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <ul className="space-y-2 pr-1">
                {targets.map((target) => {
                  const isSelected = !excluded.includes(target.flagKey)
                  return (
                    <li
                      key={target.flagKey}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggle(target.flagKey)}
                        className="shrink-0"
                        aria-label={t('write.delete.rowLabel', { flag: target.flagKey })}
                      />
                      <span
                        className="min-w-0 flex-1 basis-48 truncate font-mono text-sm text-foreground"
                        title={target.flagKey}
                      >
                        {target.flagKey}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {target.environments.length > 0
                          ? t('write.delete.environments', { envs: target.environments.join(', ') })
                          : t('write.delete.noEnvironments')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t('write.delete.selected', { count: selected.length, total: targets.length })}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} disabled={pending}>
                  {t('write.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onConfirm(selected.map((target) => target.flagKey))}
                  disabled={pending || selected.length === 0}
                  className="gap-2"
                >
                  {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                  {t('write.delete.confirm')}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
