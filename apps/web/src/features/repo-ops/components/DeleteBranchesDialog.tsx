import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BranchCleanupPageItemType, DeleteGithubBranchesMutation } from '@/generated/graphql'
import { useDeleteGithubBranches } from '../hooks/use-delete-github-branches'

const DELETE_CONFIRMATION_WORD = 'DELETE'

type DeleteOutcome = DeleteGithubBranchesMutation['deleteGithubBranches'][number]

interface DeleteBranchesDialogProps {
  projectId: string
  branches: BranchCleanupPageItemType[]
  overriddenBranchNames: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteBranchesDialog({
  projectId,
  branches,
  overriddenBranchNames,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBranchesDialogProps) {
  const { t, i18n } = useTranslation('repoOps')
  const locale = i18n.language.startsWith('es') ? es : enUS
  const { deleteGithubBranches, loading } = useDeleteGithubBranches()
  const [confirmationInput, setConfirmationInput] = useState('')
  const [outcomes, setOutcomes] = useState<DeleteOutcome[] | null>(null)

  const canConfirm = confirmationInput.trim() === DELETE_CONFIRMATION_WORD

  async function handleConfirm() {
    const result = await deleteGithubBranches({
      variables: {
        input: {
          projectId,
          branchNames: branches.map((branch) => branch.name),
          overriddenBranchNames,
        },
      },
    })
    const nextOutcomes = result.data?.deleteGithubBranches ?? []
    setOutcomes(nextOutcomes)

    const deletedCount = nextOutcomes.filter((outcome) => outcome.deleted).length
    if (deletedCount === nextOutcomes.length && nextOutcomes.length > 0) {
      toast.success(t('delete.toastAllDeleted', { count: deletedCount }))
    } else {
      toast.warning(t('delete.toastPartial', { deleted: deletedCount, total: nextOutcomes.length }))
      for (const outcome of nextOutcomes) {
        if (!outcome.deleted) {
          toast.error(
            t('delete.toastRefused', {
              branchName: outcome.branchName,
              reason: outcome.reason ?? t('delete.outcomeRefused'),
            }),
          )
        }
      }
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setConfirmationInput('')
      if (outcomes) onDeleted()
      setOutcomes(null)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete.dialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete.dialogDescription', { count: branches.length })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {outcomes === null ? (
          <div className="space-y-4">
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-[var(--radius-button)] border border-border/60 bg-muted/30 p-3">
              {branches.map((branch) => {
                const authorName = branch.lastCommitAuthorLogin ?? branch.lastCommitAuthorName
                return (
                  <li key={branch.name} className="space-y-0.5">
                    <p className="truncate font-mono text-sm text-foreground">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('delete.listLastActivity', {
                        time: branch.lastCommitAt
                          ? formatDistanceToNow(new Date(branch.lastCommitAt), { addSuffix: true, locale })
                          : t('delete.unknownActivity'),
                      })}
                      {' · '}
                      {t('delete.listAuthor', { author: authorName ?? t('delete.unknownAuthor') })}
                    </p>
                  </li>
                )
              })}
            </ul>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                {t('delete.confirmationLabel', { word: DELETE_CONFIRMATION_WORD })}
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmationInput}
                onChange={(event) => setConfirmationInput(event.target.value)}
                placeholder={DELETE_CONFIRMATION_WORD}
                autoComplete="off"
              />
            </div>
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {outcomes.map((outcome) => (
              <li
                key={outcome.branchName}
                className="flex items-start gap-2 rounded-[var(--radius-button)] border border-border/60 p-3"
              >
                {outcome.deleted ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-foreground">{outcome.branchName}</p>
                  <p className="text-xs text-muted-foreground">
                    {outcome.deleted ? t('delete.outcomeDeleted') : (outcome.reason ?? t('delete.outcomeRefused'))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          {outcomes === null ? (
            <>
              <AlertDialogCancel disabled={loading}>{t('delete.cancel')}</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={!canConfirm || loading || branches.length === 0}
                onClick={() => void handleConfirm()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
                {t('delete.confirm')}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t('delete.close')}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
