import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DELETE_RELEASE } from '../graphql/releases.mutations'
import { GET_RELEASES } from '../graphql/releases.queries'

interface DeleteReleaseButtonProps {
  releaseId: string
  projectId: string
  releaseLabel: string
  onDeleted?: () => void
  variant?: 'icon' | 'menuitem'
}

export function DeleteReleaseButton({
  releaseId,
  projectId,
  releaseLabel,
  onDeleted,
  variant = 'icon',
}: DeleteReleaseButtonProps) {
  const { t } = useTranslation('releases')
  const [open, setOpen] = useState(false)

  const [deleteRelease, { loading }] = useMutation(DELETE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES, variables: { projectId } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success(t('delete.success'))
      setOpen(false)
      onDeleted?.()
    },
    onError: () => {
      toast.error(t('delete.error'))
    },
  })

  const handleConfirm = () => {
    deleteRelease({ variables: { releaseId } })
  }

  const triggerRender =
    variant === 'icon' ? (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('delete.ariaLabel')}
        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    ) : (
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden />
        {t('delete.label')}
      </Button>
    )

  return (
    <Can I={Action.DELETE} a={Subject.RELEASE}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={triggerRender} />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.dialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.dialogDescription', { releaseLabel })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Can>
  )
}
