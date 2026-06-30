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
import { DELETE_FEATURE } from '../graphql/features.mutations'
import { LIST_FEATURES } from '../graphql/features.queries'

interface DeleteFeatureButtonProps {
  featureId: string
  projectId: string
  featureName: string
  onDeleted?: () => void
}

export function DeleteFeatureButton({
  featureId,
  projectId,
  featureName,
  onDeleted,
}: DeleteFeatureButtonProps) {
  const { t } = useTranslation('features')
  const [open, setOpen] = useState(false)

  const [deleteFeature, { loading }] = useMutation(DELETE_FEATURE, {
    refetchQueries: [{ query: LIST_FEATURES, variables: { projectId } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success(t('delete.success'))
      setOpen(false)
      onDeleted?.()
    },
    onError: (error) => {
      toast.error(error.message || t('delete.error'))
    },
  })

  const handleConfirm = () => {
    deleteFeature({ variables: { id: featureId } })
  }

  return (
    <Can I={Action.DELETE} a={Subject.FEATURE}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('delete.ariaLabel', { name: featureName })}
              className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          }
        />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.dialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.dialogDescription', { name: featureName })}
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
