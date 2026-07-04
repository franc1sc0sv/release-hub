import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldOff, TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import type { BranchBlockReason } from '@/generated/graphql'

interface UnprotectBranchDialogProps {
  branchName: string
  blockReasons: BranchBlockReason[]
  onConfirm: () => void
}

export function UnprotectBranchDialog({ branchName, blockReasons, onConfirm }: UnprotectBranchDialogProps) {
  const { t } = useTranslation('repoOps')
  const enumLabels = useEnumLabels()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [understood, setUnderstood] = useState(false)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setStep(1)
      setUnderstood(false)
    }
  }

  function handleConfirm() {
    onConfirm()
    handleOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-label={t('protected.unprotectTrigger', { branchName })}
          >
            <ShieldOff className="size-3.5" aria-hidden />
            {t('protected.unprotect')}
          </Button>
        }
      />
      <AlertDialogContent className="sm:max-w-lg">
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('protected.unprotectDialog.title', { branchName })}</AlertDialogTitle>
              <AlertDialogDescription>{t('protected.unprotectDialog.description')}</AlertDialogDescription>
            </AlertDialogHeader>

            <ul className="space-y-2 rounded-[var(--radius-button)] border border-amber-500/30 bg-amber-500/5 p-3">
              {blockReasons.map((reason) => (
                <li key={reason} className="flex gap-2 text-sm text-foreground">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
                  <span>
                    <span className="font-medium">{enumLabels.branchBlockReason(reason)}:</span>{' '}
                    {t(`protected.reasonDescription.${reason}`)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-2">
              <Checkbox
                id="unprotect-understand"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
              />
              <Label htmlFor="unprotect-understand" className="text-sm font-normal text-muted-foreground">
                {t('protected.unprotectDialog.acknowledge')}
              </Label>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>{t('protected.unprotectDialog.cancel')}</AlertDialogCancel>
              <Button disabled={!understood} onClick={() => setStep(2)}>
                {t('protected.unprotectDialog.continue')}
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('protected.unprotectDialog.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('protected.unprotectDialog.confirmDescription', { branchName })}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button variant="ghost" onClick={() => setStep(1)}>
                {t('protected.unprotectDialog.back')}
              </Button>
              <Button variant="destructive" onClick={handleConfirm} className="gap-2">
                <ShieldOff className="size-4" aria-hidden />
                {t('protected.unprotectDialog.confirmAction')}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
