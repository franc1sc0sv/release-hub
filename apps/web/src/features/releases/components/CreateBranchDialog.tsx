import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CREATE_GITHUB_BRANCH } from '../graphql/releases.mutations'
import { GITHUB_BRANCHES } from '../graphql/releases.queries'
import { BranchCombobox } from './BranchCombobox'
import type { GithubBranchType } from '@/generated/graphql'

interface CreateBranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  branches: GithubBranchType[]
  defaultFromRef: string
  onCreated: (branchName: string) => void
}

export function CreateBranchDialog({
  open,
  onOpenChange,
  projectId,
  branches,
  defaultFromRef,
  onCreated,
}: CreateBranchDialogProps) {
  const { t } = useTranslation('releases')
  const [fromRef, setFromRef] = useState(defaultFromRef)
  const [name, setName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const [createGithubBranch, { loading }] = useMutation(CREATE_GITHUB_BRANCH, {
    refetchQueries: [{ query: GITHUB_BRANCHES, variables: { projectId } }],
  })

  function reset() {
    setName('')
    setLocalError(null)
    setFromRef(defaultFromRef)
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setLocalError(t('wizard.createBranch.nameRequired'))
      return
    }
    if (!fromRef) {
      setLocalError(t('wizard.createBranch.fromRefRequired'))
      return
    }
    setLocalError(null)
    try {
      const { data } = await createGithubBranch({
        variables: { input: { projectId, name: trimmed, fromRef } },
      })
      if (data) {
        onCreated(data.createGithubBranch.name)
        handleOpenChange(false)
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t('wizard.createBranch.error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('wizard.createBranch.title')}</DialogTitle>
          <DialogDescription>{t('wizard.createBranch.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" id="create-branch-form">
          <div className="space-y-2">
            <Label htmlFor="from-ref">{t('wizard.createBranch.fromRef')}</Label>
            <BranchCombobox
              id="from-ref"
              branches={branches}
              value={fromRef}
              onChange={setFromRef}
              placeholder={t('wizard.createBranch.fromRefPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-name">{t('wizard.createBranch.name')}</Label>
            <Input
              id="branch-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setLocalError(null)
              }}
              placeholder={t('wizard.createBranch.namePlaceholder')}
              autoFocus
              autoComplete="off"
            />
          </div>

          {localError && (
            <Alert variant="destructive">
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-branch-form"
            disabled={loading || !name.trim() || !fromRef}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
            {loading ? t('wizard.createBranch.creating') : t('wizard.createBranch.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
