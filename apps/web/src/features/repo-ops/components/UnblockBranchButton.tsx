import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { useUnblockBranch } from '../hooks/use-unblock-branch'

interface UnblockBranchButtonProps {
  projectId: string
  branchName: string
}

export function UnblockBranchButton({ projectId, branchName }: UnblockBranchButtonProps) {
  const { t } = useTranslation('repoOps')
  const [open, setOpen] = useState(false)
  const { unblockBranch, loading } = useUnblockBranch()

  async function handleConfirm() {
    try {
      await unblockBranch({ variables: { input: { projectId, branchName } } })
      toast.success(t('unblock.success', { branchName }))
      setOpen(false)
    } catch {
      toast.error(t('unblock.error'))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('unblock.trigger', { branchName })}>
            <ShieldOff className="size-4" aria-hidden />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('unblock.dialogTitle', { branchName })}</AlertDialogTitle>
          <AlertDialogDescription>{t('unblock.dialogDescription', { branchName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('unblock.cancel')}</AlertDialogCancel>
          <Button onClick={() => void handleConfirm()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t('unblock.confirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
