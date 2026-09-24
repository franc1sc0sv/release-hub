import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FLAG_CLOSED_REASON_OPTIONS, FlagClosedReasonValue } from '../constants/flag-enums'
import type { FlagClosedReason } from '@/generated/graphql'

export interface CloseFlagRequest {
  reason: FlagClosedReason
  deleteInFlagsmith: boolean
}

interface CloseFlagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flagKey: string
  pending: boolean
  canDeleteInFlagsmith: boolean
  onConfirm: (request: CloseFlagRequest) => void
}

export function CloseFlagDialog({
  open,
  onOpenChange,
  flagKey,
  pending,
  canDeleteInFlagsmith,
  onConfirm,
}: CloseFlagDialogProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()
  const [reason, setReason] = useState<FlagClosedReason>(FlagClosedReasonValue.ABANDONED)
  const [deleteInFlagsmith, setDeleteInFlagsmith] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason(FlagClosedReasonValue.ABANDONED)
    setDeleteInFlagsmith(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="break-all">{t('close.title', { flag: flagKey })}</DialogTitle>
          <DialogDescription>{t('close.description')}</DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-overline uppercase tracking-widest text-muted-foreground">
            {t('close.reasonLabel')}
          </legend>
          <RadioGroup
            value={reason}
            onValueChange={(value) => {
              const picked = FLAG_CLOSED_REASON_OPTIONS.find((option) => option === value)
              if (picked) setReason(picked)
            }}
            className="gap-2"
          >
            {FLAG_CLOSED_REASON_OPTIONS.map((option) => (
              <Label
                key={option}
                htmlFor={`close-reason-${option}`}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border border-border px-3 py-2.5 font-normal has-data-checked:border-brand-indigo-bright/70 has-data-checked:bg-brand-indigo-bright/10"
              >
                <RadioGroupItem id={`close-reason-${option}`} value={option} className="mt-0.5 border-white/40" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {enumLabels.flagClosedReason(option)}
                  </span>
                  <span className="text-xs text-muted-foreground">{t(`close.reasonHint.${option}`)}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>

        {canDeleteInFlagsmith && (
          <Label className="flex cursor-pointer items-center gap-3 font-normal">
            <Checkbox
              className="border-white/40"
              checked={deleteInFlagsmith}
              onCheckedChange={(checked) => setDeleteInFlagsmith(checked === true)}
            />
            <span className="text-sm text-foreground">{t('close.deleteInFlagsmith')}</span>
          </Label>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            {t('write.cancel')}
          </Button>
          <Button
            onClick={() => onConfirm({ reason, deleteInFlagsmith })}
            disabled={pending}
            className="gap-2"
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {t('close.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
