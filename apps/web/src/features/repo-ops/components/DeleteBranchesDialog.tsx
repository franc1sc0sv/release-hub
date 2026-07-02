import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, Trash2, XCircle } from 'lucide-react'
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
import type { DeleteGithubBranchesMutation } from '@/generated/graphql'
import { useDeleteGithubBranches } from '../hooks/use-delete-github-branches'

type DeleteOutcome = DeleteGithubBranchesMutation['deleteGithubBranches'][number]

interface DeleteBranchesDialogProps {
  projectId: string
  branchNames: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteBranchesDialog({
  projectId,
  branchNames,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBranchesDialogProps) {
  const { t } = useTranslation('repoOps')
  const { deleteGithubBranches, loading } = useDeleteGithubBranches(projectId)
  const [confirmationInput, setConfirmationInput] = useState('')
  const [outcomes, setOutcomes] = useState<DeleteOutcome[] | null>(null)

  const requiredConfirmation = String(branchNames.length)
  const canConfirm = confirmationInput.trim() === requiredConfirmation

  async function handleConfirm() {
    const result = await deleteGithubBranches({ variables: { input: { projectId, branchNames } } })
    const nextOutcomes = result.data?.deleteGithubBranches ?? []
    setOutcomes(nextOutcomes)
    if (nextOutcomes.every((outcome) => outcome.deleted)) {
      onDeleted()
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      setConfirmationInput('')
      setOutcomes(null)
      if (outcomes) onDeleted()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete.dialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete.dialogDescription', { count: branchNames.length })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {outcomes === null ? (
          <div className="space-y-4">
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-[var(--radius-button)] border border-border/60 bg-muted/30 p-3">
              {branchNames.map((name) => (
                <li key={name} className="truncate font-mono text-sm text-foreground">
                  {name}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                {t('delete.confirmationLabel', { count: branchNames.length })}
              </Label>
              <Input
                id="delete-confirmation"
                value={confirmationInput}
                onChange={(event) => setConfirmationInput(event.target.value)}
                placeholder={requiredConfirmation}
                inputMode="numeric"
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
                    {outcome.deleted
                      ? t('delete.outcomeDeleted')
                      : (outcome.reason ?? t('delete.outcomeRefused'))}
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
                disabled={!canConfirm || loading}
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
