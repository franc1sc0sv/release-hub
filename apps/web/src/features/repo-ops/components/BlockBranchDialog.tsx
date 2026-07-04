import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useBlockBranch } from '../hooks/use-block-branch'

interface BlockBranchDialogProps {
  projectId: string
  branchName: string
}

export function BlockBranchDialog({ projectId, branchName }: BlockBranchDialogProps) {
  const { t } = useTranslation('repoOps')
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const { blockBranch, loading } = useBlockBranch()

  async function handleConfirm() {
    try {
      await blockBranch({
        variables: {
          input: { projectId, branchName, reason: reason.trim() || undefined },
        },
      })
      toast.success(t('block.success', { branchName }))
      setOpen(false)
      setReason('')
    } catch {
      toast.error(t('block.error'))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setReason('')
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('block.trigger', { branchName })}>
            <Ban className="size-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('block.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('block.dialogDescription', { branchName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="block-branch-reason">{t('block.reasonLabel')}</Label>
          <Textarea
            id="block-branch-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('block.reasonPlaceholder')}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            {t('block.cancel')}
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t('block.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
